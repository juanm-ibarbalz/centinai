import express from "express";
import {
  /*verifyWebhook,*/
  handleIncomingMessage,
} from "../controllers/webhookController.js";

const router = express.Router();

// Webhook routes for external service integration

// POST /webhook → Process incoming messages from external services (e.g., WhatsApp)
router.post("/", handleIncomingMessage);

export default router;
