import express from "express";
import User from "../../models/User.js";

const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

export default router;
