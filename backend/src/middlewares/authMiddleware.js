import jwt from "jsonwebtoken";
import { authConfig } from "../config/config.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};
