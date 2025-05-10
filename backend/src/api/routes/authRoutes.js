import express from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { loginLimiter } from "../../middlewares/rateLimiters.js";

const router = express.Router();

// Rutas de autenticación
// POST /auth/register → Registra un nuevo usuario
router.post("/register", register);

// POST /auth/login → Inicia sesión y devuelve token
router.post("/login", loginLimiter, login);

// GET /auth/protected → Ruta protegida con JWT (solo para prueba)
router.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "Ruta protegida accedida correctamente",
    user: req.user,
  });
});

export default router;
