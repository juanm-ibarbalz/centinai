// Centralized configuration for CentinAI backend
import dotenv from "dotenv";
dotenv.config();

/**
 * Configuración general de la aplicación.
 */
export const appConfig = {
  isDev: process.env.NODE_ENV !== "production",
  logVerbose: true,
};

/**
 * Configuración de autenticación JWT.
 */
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
};

/**
 * Prefijos para IDs únicos generados por el sistema.
 */
export const idConfig = {
  userPrefix: "usr",
  agentPrefix: "agt",
  conversationPrefix: "conv",
  messagePrefix: "msg",
};

/**
 * Configuración relacionada a la duración y limpieza de conversaciones.
 */
export const conversationConfig = {
  timeoutMs: 120 * 60 * 1000, // 2 horas de inactividad
  cleanupIntervalMinutes: 5,
  defaultConversationStatus: "open",
};

/**
 * Configuración de seguridad para limitar intentos de login.
 */
export const securityConfig = {
  loginRateLimit: {
    windowMinutes: 1,
    maxAttempts: 5,
    errorMessage: "Demasiados intentos. Intente nuevamente en un minuto.",
  },
};

/**
 * Configuración de límites del sistema.
 */
export const limitsConfig = {
  maxAgentsPerUser: 3,
};
