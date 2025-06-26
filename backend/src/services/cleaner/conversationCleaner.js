import cron from "node-cron";
import Conversation from "../../models/Conversation.js";
import { conversationConfig } from "../../config/config.js";
import { exportAndCloseConversations } from "../helpers/conversation.helpers.js";

/**
 * Retrieves conversations that have expired due to timeout.
 * Finds all open conversations that haven't been updated within the configured timeout period.
 *
 * @returns {Promise<Array>} Array of expired conversation objects
 */
const getExpiredConversations = async () => {
  const now = new Date();
  const timeoutLimit = new Date(now.getTime() - conversationConfig.timeoutMs);

  const conversationsToClose = await Conversation.find({
    status: conversationConfig.defaultConversationStatus,
    updatedAt: { $lt: timeoutLimit },
  }).lean();

  if (conversationsToClose.length === 0) return [];

  return conversationsToClose;
};

/**
 * Starts the periodic cleanup job that closes expired conversations,
 * prepares them for analysis, and dispatches to the analyzer system.
 * Runs on a configurable interval defined in conversationConfig.cleanupIntervalMinutes.
 *
 * Job workflow:
 * 1. Find expired conversations
 * 2. Build export payloads for analysis
 * 3. Dispatch payloads directly to analyzer system
 * 4. Close the expired conversations
 *
 * @returns {void} Sets up the cron job for automatic conversation cleanup
 */
export const startConversationCleanupJob = () => {
  const intervalMinutes = conversationConfig.cleanupIntervalMinutes;

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    const conversations = await getExpiredConversations();
    if (conversations.length === 0) {
      console.warn("No hay conversaciones para cerrar por timeout.");
      return;
    }

    try {
      await exportAndCloseConversations(conversations);
    } catch (error) {
      console.error(
        "Error en limpieza automática de conversaciones:",
        error.message
      );
    }
  });
};
