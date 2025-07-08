import express from "express";
import corsMiddleware from "./middlewares/corsOptions.js";
import webhookRoutes from "./api/routes/webhookRoutes.js";
import authRoutes from "./api/routes/authRoutes.js";
import conversationsRoutes from "./api/routes/conversationsRoutes.js";
import agentsRoutes from "./api/routes/agentRoutes.js";
import messageRoutes from "./api/routes/messageRoutes.js";
import metricsRoutes from "./api/routes/metricsRoutes.js";
import userRoutes from "./api/routes/userRoutes.js";
import { authenticate } from "./middlewares/authMiddleware.js";

const app = express();
app.use(corsMiddleware);
app.use(express.json());
app.use("/webhook", webhookRoutes);
app.use("/auth", authRoutes);
app.use("/conversations", authenticate, conversationsRoutes);
app.use("/agents", authenticate, agentsRoutes);
app.use("/messages", authenticate, messageRoutes);
app.use("/metrics", authenticate, metricsRoutes);
app.use("/users", authenticate, userRoutes);
app.get("/", (_, res) => res.send("CentinAI Backend API OK"));

export default app;
