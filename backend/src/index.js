import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import connectDB from "./db/connect.js";
import webhookRoutes from "./api/routes/webhookRoutes.js";
import { startConversationCleanupJob } from "./utils/conversationCleaner.js";
import authRoutes from "./api/routes/authRoutes.js";
import conversationsRoutes from "./api/routes/conversationsRoutes.js";
import agentsRoutes from "./api/routes/agentRoutes.js";
import messageRoutes from "./api/routes/messageRoutes.js";

startConversationCleanupJob();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/webhook", webhookRoutes);
app.use("/auth", authRoutes);
app.use("/conversations", conversationsRoutes);
app.use("/messages", messageRoutes);
app.use("/agents", agentsRoutes);
app.get("/", (_, res) => res.send("CentinAI Backend API OK"));

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
