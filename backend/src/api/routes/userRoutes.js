import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  updateUserController,
  changePasswordController,
} from "../controllers/userController.js";

const router = express.Router();

// User management routes (all require authentication)
// PATCH /users/me → Update authenticated user's profile information
router.patch("/me", authenticate, updateUserController);

// PATCH /users/me/password → Change authenticated user's password
router.patch("/me/password", authenticate, changePasswordController);

export default router;
