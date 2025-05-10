import rateLimit from "express-rate-limit";
import { securityConfig } from "../config/config.js";

const { windowMinutes, maxAttempts, errorMessage } =
  securityConfig.loginRateLimit;

/**
 * Middleware de rate limit para el endpoint de login.
 * Limita la cantidad de intentos permitidos en un período de tiempo.
 */
export const loginLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000, // Ventana de tiempo en milisegundos
  max: maxAttempts, // Máximo de intentos permitidos
  message: { error: errorMessage }, // Mensaje devuelto al alcanzar el límite
  standardHeaders: true, // Usa headers estándar
  legacyHeaders: false, // Desactiva headers antiguos
});
