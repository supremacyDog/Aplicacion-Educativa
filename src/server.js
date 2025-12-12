import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import passport from "passport";
import session from "express-session";

import authRoutes from "./routes/authRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const { Pool } = pkg;

const app = express();

/**
 * ================================
 * MIDDLEWARES BÁSICOS
 * ================================
 */
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "clave_segura",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/**
 * ================================
 * CONEXIÓN A POSTGRES (RENDER)
 * ================================
 * SOLO DATABASE_URL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Prueba rápida de conexión (sin loops infinitos)
pool
  .query("SELECT 1")
  .then(() => console.log("✅ Conectado a PostgreSQL"))
  .catch((err) => {
    console.error("❌ Error conectando a PostgreSQL:", err.message);
    process.exit(1);
  });

/**
 * ================================
 * RUTAS
 * ================================
 */
app.use("/api", registerRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

/**
 * ================================
 * ARCHIVOS ESTÁTICOS
 * ================================
 */
app.use(express.static("src/views"));
app.use("/css", express.static("src/views/css"));
app.use("/js", express.static("src/views/js"));
app.use("/components", express.static("src/views/components"));
app.use("/pages", express.static("src/views/pages"));

/**
 * ================================
 * RUTAS DE VISTAS
 * ================================
 */
app.get("/", (req, res) => {
  res.sendFile("pages/login.html", { root: "src/views" });
});

app.get("/registro", (req, res) => {
  res.sendFile("pages/registro.html", { root: "src/views" });
});

app.get("/dashboard", (req, res) => {
  res.sendFile("pages/dashboard.html", { root: "src/views" });
});

app.get("/topic_uno", (req, res) => {
  res.sendFile("pages/topic_uno.html", { root: "src/views" });
});

/**
 * ================================
 * ARRANQUE DEL SERVIDOR
 * ================================
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

export default app;
