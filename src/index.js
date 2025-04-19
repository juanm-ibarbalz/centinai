import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import webhookRoutes from "./api/webhook.routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/webhook", webhookRoutes);

app.get("/", (_, res) => res.send("CentinAI Backend API OK"));

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
