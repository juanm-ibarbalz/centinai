import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  updateUserController,
  changePasswordController,
} from "../controllers/userController.js";

const router = express.Router();

// Rutas de usuarios
// PATCH /users/me → Actualiza datos del usuario autenticado
router.patch("/me", authenticate, updateUserController);

// PATCH /users/me/password → Cambia la contraseña del usuario
router.patch("/me/password", authenticate, changePasswordController);

export default router;
