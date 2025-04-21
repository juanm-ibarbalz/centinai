import express from "express";
import {
  verifyWebhook,
  handleIncomingMessage,
  finalizeConversation,
} from "../controllers/webhook.controller.js";

const router = express.Router();

router.get("/", verifyWebhook);
router.post("/", handleIncomingMessage);
router.put("/conversations/:id/finalize", finalizeConversation);

export default router;
