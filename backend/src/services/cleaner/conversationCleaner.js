import cron from "node-cron";
import Conversation from "../../models/Conversation.js";
import { conversationConfig } from "../../config/config.js";
import { buildExportPayloads } from "./exportConversations.js";
import { dispatchToAnalyzer } from "./analyzerDispatcher.js";

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
 * Closes conversations by their IDs in bulk.
 * Updates multiple conversations to "closed" status.
 *
 * @param {string[]} convIds - Array of conversation IDs to close
 * @returns {Promise<void>} Resolves when all conversations are closed
 * @throws {Error} When no conversation IDs are provided or if an error occurs during update
 */
const closeConversationsById = async (convIds) => {
  if (!convIds || convIds.length === 0) {
    throw new Error("There are no conversations to close.");
  }

  await Conversation.updateMany(
    { _id: { $in: convIds } },
    { $set: { status: conversationConfig.closingConversationStatus } }
  );
  console.log(`${convIds.length} conversations closed due to timeout.`);
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
      const payloads = await buildExportPayloads(conversations);
      await dispatchToAnalyzer(payloads);
      await closeConversationsById(conversations.map((c) => c._id));
    } catch (error) {
      console.error(
        "Error en limpieza automática de conversaciones:",
        error.message
      );
    }
  });
};
