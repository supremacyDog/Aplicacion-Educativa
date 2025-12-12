import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

/**
 * ================================
 * CONFIGURACIÓN GLOBAL
 * ================================
 */
const DEFAULT_FOTO = "/img/default-user.png";

/**
 * ================================
 * CONEXIÓN A POSTGRES (RENDER)
 * ================================
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * ================================
 * NORMALIZAR FOTO
 * ================================
 */
function normalizarFoto(foto) {
  if (!foto || typeof foto !== "string") return DEFAULT_FOTO;
  if (foto.trim().length < 6) return DEFAULT_FOTO;
  return foto;
}

/**
 * ================================
 * BUSCAR O CREAR USUARIO (OAUTH)
 * ================================
 */
async function findOrCreateUser(email, nombre, apellido, provider, foto) {
  try {
    const fotoFinal = normalizarFoto(foto);

    const result = await pool.query(
      "SELECT * FROM users WHERE correo = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      const passDummy = await bcrypt.hash("OAUTH_USER_PASS", 10);

      const nuevo = await pool.query(
        `
        INSERT INTO users (nombre, apellido, correo, contraseña, rol, fecha_creacion, foto)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
          nombre,
          apellido,
          email,
          passDummy,
          "estudiante",
          new Date(),
          fotoFinal,
        ]
      );

      return nuevo.rows[0];
    }

    const usuario = result.rows[0];

    // Actualizar foto solo si es distinta y válida
    if (fotoFinal !== usuario.foto) {
      await pool.query("UPDATE users SET foto = $1 WHERE correo = $2", [
        fotoFinal,
        email,
      ]);
      usuario.foto = fotoFinal;
    }

    return usuario;
  } catch (error) {
    console.error("Error en findOrCreateUser:", error);
    throw error;
  }
}

/**
 * ================================
 * GOOGLE OAUTH
 * ================================
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_, __, profile, done) => {
      try {
        const correo = profile.emails?.[0]?.value;
        const nombre = profile.name?.givenName || "";
        const apellido = profile.name?.familyName || "";
        const foto = profile.photos?.[0]?.value;

        const usuario = await findOrCreateUser(
          correo,
          nombre,
          apellido,
          "Google",
          foto
        );

        done(null, usuario);
      } catch (error) {
        done(error);
      }
    }
  )
);

/**
 * ================================
 * MICROSOFT OAUTH
 * ================================
 */
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
      scope: ["user.read"],
      tenant: process.env.MICROSOFT_TENANT_ID || "common",
    },
    async (_, __, profile, done) => {
      try {
        const correo =
          profile.emails?.[0]?.value ||
          profile._json?.mail ||
          profile._json?.userPrincipalName;

        if (!correo) {
          return done(new Error("No se pudo obtener el email"), null);
        }

        const nombre = profile.name?.givenName || profile.displayName || "";
        const apellido = profile.name?.familyName || "";
        const foto = profile._json?.photo;

        const usuario = await findOrCreateUser(
          correo,
          nombre,
          apellido,
          "Microsoft",
          foto
        );

        done(null, usuario);
      } catch (error) {
        done(error);
      }
    }
  )
);

/**
 * ================================
 * SESIONES
 * ================================
 */
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

/**
 * ================================
 * JWT + REDIRECCIÓN
 * ================================
 */
const generarTokenYRedirigir = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login.html?error=usuario_no_encontrado");
  }

  req.login(req.user, (err) => {
    if (err) return next(err);

    const token = jwt.sign(req.user, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "2h",
    });

    const queryString = new URLSearchParams({
      token,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      correo: req.user.correo,
      foto: normalizarFoto(req.user.foto),
    }).toString();

    res.redirect(`/dashboard?${queryString}`);
  });
};

export const googleCallback = generarTokenYRedirigir;
export const microsoftCallback = generarTokenYRedirigir;

/**
 * ================================
 * REGISTRO MANUAL
 * ================================
 */
export const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, correo, contraseña, rol } = req.body;

    if (!nombre || !apellido || !correo || !contraseña) {
      return res.status(400).json({ message: "Campos obligatorios" });
    }

    const existe = await pool.query("SELECT 1 FROM users WHERE correo = $1", [
      correo,
    ]);

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "Correo ya registrado" });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    await pool.query(
      `
      INSERT INTO users (nombre, apellido, correo, contraseña, rol, fecha_creacion, foto)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        nombre,
        apellido,
        correo,
        hash,
        rol || "estudiante",
        new Date(),
        DEFAULT_FOTO,
      ]
    );

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

/**
 * ================================
 * MIDDLEWARES
 * ================================
 */
export const isProfessor = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  if (["profesor", "profesor editor"].includes(req.user.rol)) return next();
  return res.status(403).json({ error: "No autorizado" });
};

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated?.()) return next();
  return res.status(401).json({ error: "No autenticado" });
};

/**
 * ================================
 * LOGIN MANUAL
 * ================================
 */
export const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const result = await pool.query("SELECT * FROM users WHERE correo = $1", [
      correo,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Correo no registrado" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(contraseña, user.contraseña);

    if (!match) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Error de sesión" });

      const token = jwt.sign(user, process.env.JWT_SECRET || "secret_key", {
        expiresIn: "2h",
      });

      res.json({
        redirect: `/dashboard?${new URLSearchParams({
          token,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          foto: normalizarFoto(user.foto),
        }).toString()}`,
      });
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno" });
  }
};
