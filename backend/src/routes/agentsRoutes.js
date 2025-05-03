import express from "express";
import Agent from "../models/Agent.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /agents - Registrar un agente (requiere autenticación)
router.post("/", authenticate, async (req, res) => {
  const { phoneNumberId } = req.body;
  const userId = req.user.id; // viene del token JWT

  if (!phoneNumberId) {
    return res.status(400).json({ error: "Falta el phoneNumberId" });
  }

  try {
    // Verificamos si ya existe
    const existing = await Agent.findOne({ phoneNumberId });
    if (existing) {
      return res.status(409).json({ error: "Este agente ya está registrado" });
    }

    const agent = await Agent.create({ phoneNumberId, userId });
    res.status(201).json(agent);
  } catch (error) {
    console.error("Error al registrar agente:", error);
    res.status(500).json({ error: "Error al registrar agente" });
  }
});

export default router;
