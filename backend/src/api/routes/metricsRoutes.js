import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  getMetricsByAgentController,
  getMetricByConversationController,
  getMetricsByUserController,
} from "../controllers/metricsController.js";

const router = express.Router();

// Metrics and analytics routes (all require authentication)

// GET /metrics → List metrics for a specific agent (with optional agentPhoneNumberId filter)
router.get("/", authenticate, getMetricsByAgentController);

// GET /metrics/all → List all metrics across all agents for the authenticated user
router.get("/all", authenticate, getMetricsByUserController);

// GET /metrics/:conversationId → Get detailed metrics for a specific conversation
router.get("/:conversationId", authenticate, getMetricByConversationController);

export default router;
