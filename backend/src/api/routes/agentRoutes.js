import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  createAgentController,
  deleteAgentController,
  getAgentsController,
} from "../controllers/agentController.js";

const router = express.Router();

// Rutas de agentes
// POST /agents → Crea un nuevo agente
router.post("/", authenticate, createAgentController);

// DELETE /agents/:id → Elimina un agente y su contenido
router.delete("/:id", authenticate, deleteAgentController);

// GET /agents → Lista todos los agentes del usuario autenticado
router.get("/", authenticate, getAgentsController);

export default router;
