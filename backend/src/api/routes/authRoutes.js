import express from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { loginLimiter } from "../../middlewares/rateLimiters.js";

const router = express.Router();

// Authentication routes
// POST /auth/register → Register a new user account
router.post("/register", register);

// POST /auth/login → Authenticate user and return JWT token (rate limited)
router.post("/login", loginLimiter, login);

// GET /auth/protected → Protected route with JWT authentication (for testing purposes)
router.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

export default router;
