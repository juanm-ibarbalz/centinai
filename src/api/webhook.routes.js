import express from "express";
import {
  verifyWebhook,
  handleIncomingMessage,
} from "../controllers/webhook.controller.js";

const router = express.Router();

router.get("/", verifyWebhook);
router.post("/", handleIncomingMessage);

export default router;
