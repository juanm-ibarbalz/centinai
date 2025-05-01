const TIMEOUT_MINUTES = 120; // Tiempo de inactividad para cerrar conversaciones
const CLEANER_INTERVAL_MINUTES = 5; // Cada cuánto corre el job de limpieza

export const conversationConfig = {
  timeoutMs: TIMEOUT_MINUTES * 60 * 1000, // usado por conversationProcessor
  cleanupIntervalMinutes: CLEANER_INTERVAL_MINUTES, // usado por el cron cleaner
  defaultConversationStatus: "open",
};
