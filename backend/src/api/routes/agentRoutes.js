import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { createAgentController } from "../controllers/agentController.js";

const router = express.Router();

// Rutas de agentes
// POST /agents → Crea un nuevo agente
router.post("/", authenticate, createAgentController);

export default router;
