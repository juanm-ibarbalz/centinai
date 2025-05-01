import express from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "Ruta protegida accedida correctamente",
    user: req.user,
  });
});

export default router;
