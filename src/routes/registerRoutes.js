console.log("REGISTER ROUTES CARGADO ✔");
import express from "express";
import { registerUser } from "../controllers/userControllers.js";
console.log("➡ registerRoutes.js CARGADO");


const router = express.Router();

router.post("/register", registerUser);

export default router;
