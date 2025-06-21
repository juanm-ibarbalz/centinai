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

// Agent management routes (all require authentication)

// POST /agents → Create a new AI agent for the authenticated user
router.post("/", authenticate, createAgentController);

// DELETE /agents/:id → Delete an agent and all associated conversations/messages
router.delete("/:id", authenticate, deleteAgentController);

// GET /agents → List all agents belonging to the authenticated user
router.get("/", authenticate, getAgentsController);

// PATCH /agents/:id/mapping → Update the field mapping configuration for an agent
router.patch("/:id/mapping", authenticate, updateAgentMappingController);

// POST /agents/:id/rotate-secret → Regenerate the secret token for webhook authentication
router.post("/:id/rotate-secret", authenticate, rotateSecretTokenController);

// PATCH /agents/:id → Update general agent information (name, description, model, etc.)
router.patch("/:id", authenticate, updateAgentController);

export default router;
