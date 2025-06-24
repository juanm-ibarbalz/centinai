import express from "express";
import { listMessages } from "../controllers/messagesController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Message management routes (all require authentication)
// GET /messages?conversationId=xxx → List paginated messages for a specific conversation
router.get("/", authenticate, listMessages);

export default router;
