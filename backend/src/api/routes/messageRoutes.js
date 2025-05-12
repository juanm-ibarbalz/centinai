import express from "express";
import { listMessages } from "../controllers/messagesController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas de mensajes
// GET /messages → Lista mensajes paginados de una conversación.
router.get("/", authenticate, listMessages);

export default router;
