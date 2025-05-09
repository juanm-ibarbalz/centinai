// Centralized configuration for CentinAI backend
import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
  isDev: process.env.NODE_ENV !== "production",
  logVerbose: true,
};

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
};

export const idConfig = {
  userPrefix: "usr",
  agentPrefix: "agt",
  conversationPrefix: "conv",
  messagePrefix: "msg",
};

export const conversationConfig = {
  timeoutMs: 120 * 60 * 1000,
  cleanupIntervalMinutes: 5,
  defaultConversationStatus: "open",
};

export const securityConfig = {
  loginRateLimit: {
    windowMinutes: 1,
    maxAttempts: 5,
    errorMessage: "Demasiados intentos. Intente nuevamente en un minuto.",
  },
};
