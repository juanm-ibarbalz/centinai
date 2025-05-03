import express from "express";
import {
  verifyWebhook,
  handleIncomingMessage,
} from "../controllers/webhookController.js";

const router = express.Router();

router.get("/", verifyWebhook);
router.post("/", handleIncomingMessage);

export default router;
