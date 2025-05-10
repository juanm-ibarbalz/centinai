import jwt from "jsonwebtoken";
import { authConfig } from "../config/config.js";
import { sendError } from "../utils/responseUtils.js";

/**
 * Middleware que autentica al usuario usando JWT.
 * Si el token es válido, agrega los datos decodificados en `req.user`.
 * Si no, responde con 401 o 403 según el caso.
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "missing_token");
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
    return sendError(res, 403, "invalid_token");
  }
};
