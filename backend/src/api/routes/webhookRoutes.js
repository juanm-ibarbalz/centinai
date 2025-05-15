import express from "express";
import {
  verifyWebhook,
  handleIncomingMessage,
} from "../controllers/webhookController.js";

const router = express.Router();

// Rutas del webhook

// POST /webhook → Recepción de mensajes entrantes (usuario o agente)
router.post("/", handleIncomingMessage);

export default router;
