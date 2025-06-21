import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { getConversationsByAgent } from "../controllers/conversationsController.js";

const router = express.Router();

// Conversation management routes (all require authentication)
// GET /conversations?agentPhoneNumberId=xxx → List conversations for a specific agent with pagination and filtering
router.get("/", authenticate, getConversationsByAgent);

export default router;
