import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  getMetricsByAgent,
  getMetricByConversation,
} from "../controllers/metricsController.js";

const router = express.Router();

router.get("/", authenticate, getMetricsByAgent);
router.get("/:conversationId", authenticate, getMetricByConversation);

export default router;
