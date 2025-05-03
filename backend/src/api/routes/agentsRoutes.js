import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { createAgent } from "../../services/agent.service.js";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  const { phoneNumberId, name, description } = req.body;
  const userId = req.user.id;

  if (!phoneNumberId || !name) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const agent = await createAgent({
      userId,
      phoneNumberId,
      name,
      description,
    });
    res.status(201).json(agent);
  } catch (error) {
    console.error("Error al registrar agente:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al registrar agente" });
  }
});

export default router;
