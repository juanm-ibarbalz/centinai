// Centralized configuration for CentinAI backend

export const appConfig = {
  isDev: process.env.NODE_ENV !== "production",
  logVerbose: true,
};

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: "1d", // default expiration
};

export const idConfig = {
  userPrefix: "usr",
  agentPrefix: "agt",
  conversationPrefix: "conv",
  messagePrefix: "msg",
};

export const conversationConfig = {
  timeoutMs: 120 * 60 * 1000, // 120 minutes
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
