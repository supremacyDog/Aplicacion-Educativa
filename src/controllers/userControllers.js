import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function findOrCreateUser(email, nombre, apellido, provider, foto = "") {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE correo = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log(`Registrando nuevo usuario desde ${provider}: ${email}`);

      const passDummy = await bcrypt.hash("OAUTH_USER_PASS", 10);
      const fechaActual = new Date();

      const insertQuery = `
        INSERT INTO users (nombre, apellido, correo, contraseña, rol, fecha_creacion, foto)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const nuevo = await pool.query(insertQuery, [
        nombre,
        apellido,
        email,
        passDummy,
        "estudiante",
        fechaActual,
        foto
      ]);
      return nuevo.rows[0];
    }

    const usuario = result.rows[0];
    if (foto && usuario.foto !== foto) {
      await pool.query("UPDATE users SET foto = $1 WHERE correo = $2", [
        foto,
        email
      ]);
      usuario.foto = foto;
    }

    return usuario;
  } catch (error) {
    console.error("Error en findOrCreateUser:", error);
    throw error;
  }
}

//GOOGLE
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const correo = profile.emails[0].value;
        const nombre = profile.name?.givenName || "";
        const apellido = profile.name?.familyName || "";
        const foto = profile.photos?.[0]?.value || "";

        const usuario = await findOrCreateUser(
          correo,
          nombre,
          apellido,
          "Google",
          foto
        );
        return done(null, usuario);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

//MICROSOFT
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/microsoft/callback",
      scope: ["user.read"],
      tenant: process.env.MICROSOFT_TENANT_ID || "common",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const correo =
          profile.emails?.[0]?.value ||
          profile._json?.mail ||
          profile._json?.userPrincipalName;

        if (!correo) {
          return done(
            new Error("No se pudo obtener el email de Microsoft"),
            null
          );
        }

        const nombre = profile.name?.givenName || profile.displayName || "";
        const apellido = profile.name?.familyName || "";
        const foto = profile._json.photo || "/img/microsoft.png";

        const usuario = await findOrCreateUser(
          correo,
          nombre,
          apellido,
          "Microsoft",
          foto
        );
        return done(null, usuario);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (e) {
    done(e);
  }
});


//Token
const generarTokenYRedirigir = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login.html?error=usuario_no_encontrado");
  }

  req.login(req.user, (err) => {
    if (err) return next(err);

    const token = jwt.sign(req.user, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "2h",
    });

    const datos = {
      token,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      correo: req.user.correo,
      foto: req.user.foto && req.user.foto.length > 5 
        ? req.user.foto 
        : "/img/microsoft.png"
    };

    const queryString = new URLSearchParams(datos).toString();

    return res.redirect(`/dashboard?${queryString}`);
  });
};

export const googleCallback = generarTokenYRedirigir;
export const microsoftCallback = generarTokenYRedirigir;

//Manual
export const registerUser = async (req, res) => {
  try {
    
    const { nombre, apellido, correo, contraseña, rol } = req.body;

    if (!nombre || !apellido || !correo || !contraseña) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    const existe = await pool.query(
      "SELECT correo FROM users WHERE correo = $1",
      [correo]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const fecha_creacion = new Date();

    await pool.query(
      `INSERT INTO users (nombre, apellido, correo, contraseña, rol, fecha_creacion, foto)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nombre, apellido, correo, hash, rol || "estudiante", fecha_creacion, "/img/microsoft.png"]
    );

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const isProfessor = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });

  if (req.user.rol === "profesor" || req.user.rol === "profesor editor") {
    return next();
  }

  return res.status(403).json({ error: "No autorizado" });
};

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "No autenticado" });
};


export const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    const result = await pool.query("SELECT * FROM users WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Correo no registrado" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    //Google
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Error en sesión" });

      const token = jwt.sign(user, process.env.JWT_SECRET || "secret_key", {
        expiresIn: "2h",
      });

      const fotoFinal =
        user.foto && user.foto.length > 5 ? user.foto : "/img/microsoft.png";

      const params = new URLSearchParams({
        token,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        foto: fotoFinal,
      }).toString();

      return res.json({
        redirect: `/dashboard?${params}`,
        message: "Login exitoso",
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};