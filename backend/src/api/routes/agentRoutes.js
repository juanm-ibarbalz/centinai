import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  createAgentController,
  deleteAgentController,
  getAgentsController,
  updateAgentMappingController,
  rotateSecretTokenController,
  updateAgentController,
} from "../controllers/agentController.js";

const router = express.Router();

// Rutas de agentes

// POST /agents → Crea un nuevo agente
router.post("/", authenticate, createAgentController);

// DELETE /agents/:id → Elimina un agente y su contenido
router.delete("/:id", authenticate, deleteAgentController);

// GET /agents → Lista todos los agentes del usuario autenticado
router.get("/", authenticate, getAgentsController);

// PATCH /agents/:id/mapping → Actualiza el fieldMapping del agente
router.patch("/:id/mapping", authenticate, updateAgentMappingController);

// POST /agents/:id/rotate-secret → Regenera el secretToken del agente
router.post("/:id/rotate-secret", authenticate, rotateSecretTokenController);

// PATCH /agents/:id → Actualiza los datos generales del agente
router.patch("/:id", authenticate, updateAgentController);

export default router;
