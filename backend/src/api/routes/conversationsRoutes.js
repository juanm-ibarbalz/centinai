import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { getConversationsByAgent } from "../controllers/conversationsController.js";

const router = express.Router();

// Rutas de conversaciones
// GET /conversations?agentPhoneNumberId=xxx → Lista conversaciones de un agente
router.get("/", authenticate, getConversationsByAgent);

export default router;
