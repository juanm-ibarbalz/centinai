import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  getMetricsByAgent,
  getMetricByConversation,
} from "../controllers/metricsController.js";

const router = express.Router();

// Rutas del webhook

// GET /metrics → Lista métricas de un agente
router.get("/", authenticate, getMetricsByAgent);

// GET /metrics/:conversationId → Obtiene métricas de una conversación específica
router.get("/:conversationId", authenticate, getMetricByConversation);

export default router;
