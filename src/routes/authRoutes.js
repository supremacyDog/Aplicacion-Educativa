import express from "express";
import passport from "passport";

import {
  googleCallback,
  microsoftCallback,
  isAuthenticated
} from "../controllers/userControllers.js";

const router = express.Router();

// Ruta para verificar usuario autenticado
router.get("/me", isAuthenticated, (req, res) => {
  res.json(req.user);
});

// Redirección a Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback de Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login.html",
    session: true,
  }),
  googleCallback
);

// Redirección Microsoft
router.get(
  "/microsoft",
  passport.authenticate("microsoft", { scope: ["user.read"] })
);

// Callback de Microsoft
router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    failureRedirect: "/login.html",
    session: true,
  }),
  microsoftCallback
);

export default router;