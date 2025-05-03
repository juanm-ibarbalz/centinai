import express from "express";
import Conversation from "../models/Conversation.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ userId })
      .sort({ lastUpdated: -1 })
      .select("-__v");

    res.json(conversations);
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    res.status(500).json({ error: "Error al obtener las conversaciones" });
  }
});

export default router;
