import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  getMetricsByAgentController,
  getMetricByConversationController,
  getMetricsByUserController,
} from "../controllers/metricsController.js";

const router = express.Router();

// Rutas del webhook

// GET /metrics → Lista métricas de un agente
router.get("/", authenticate, getMetricsByAgentController);

// GET /metrics/all → Lista todas las métricas de un usuario
router.get("/all", authenticate, getMetricsByUserController);

// GET /metrics/:conversationId → Obtiene métricas de una conversación específica
router.get("/:conversationId", authenticate, getMetricByConversationController);

export default router;
