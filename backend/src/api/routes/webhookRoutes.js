import express from "express";
import {
  verifyWebhook,
  handleIncomingMessage,
} from "../controllers/webhookController.js";

const router = express.Router();

// Rutas de webhook de WhatsApp
// GET /webhook → Verificación de suscripción desde Meta
router.get("/", verifyWebhook);

// POST /webhook → Recepción de mensajes entrantes (usuario o agente)
router.post("/", handleIncomingMessage);

export default router;
