import cron from "node-cron";
import Conversation from "../../models/Conversation.js";
import { conversationConfig } from "../../config/config.js";
import {
  buildExportPayloads,
  exportConversationsToJson,
} from "./exportConversations.js";
import { dispatchToAnalyzer } from "./analyzerDispatcher.js";

/**
 * Retrieves conversations that have expired due to timeout.
 * Finds all open conversations that haven't been updated within the configured timeout period.
 *
 * @returns {Promise<Array>} Array of expired conversation objects
 */
export const getExpiredConversations = async () => {
  const now = new Date();
  const timeoutLimit = new Date(now.getTime() - conversationConfig.timeoutMs);

  const conversationsToClose = await Conversation.find({
    status: conversationConfig.defaultConversationStatus,
    updatedAt: { $lt: timeoutLimit },
  }).lean();

  if (conversationsToClose.length === 0) {
    console.warn("No hay conversaciones para cerrar por timeout.");
    return [];
  }

  return conversationsToClose;
};

/**
 * Closes conversations by their IDs in bulk.
 * Updates multiple conversations to "closed" status and sets their end time.
 *
 * @param {string[]} convIds - Array of conversation IDs to close
 * @param {Date} [now=new Date()] - End time for the conversations (defaults to current time)
 * @returns {Promise<void>} Resolves when all conversations are closed
 */
export const closeConversationsById = async (convIds, now = new Date()) => {
  if (!convIds || convIds.length === 0) return;
  await Conversation.updateMany(
    { _id: { $in: convIds } },
    { $set: { status: "closed", endTime: now } }
  );
  console.log(`${convIds.length} conversaciones cerradas por timeout.`);
};

/**
 * Starts the periodic cleanup job that closes expired conversations,
 * prepares them for analysis, and dispatches to the analyzer system.
 * Runs on a configurable interval defined in conversationConfig.cleanupIntervalMinutes.
 *
 * Job workflow:
 * 1. Find expired conversations
 * 2. Build export payloads for analysis
 * 3. Export conversations to JSON file
 * 4. Dispatch to analyzer system
 * 5. Close the expired conversations
 *
 * @returns {void} Sets up the cron job for automatic conversation cleanup
 */
export const startConversationCleanupJob = () => {
  const intervalMinutes = conversationConfig.cleanupIntervalMinutes;
  const now = new Date();

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    try {
      const conversations = await getExpiredConversations();
      if (conversations.length === 0) return;

      const payloads = await buildExportPayloads(conversations);
      const jsonPath = exportConversationsToJson(payloads);
      await dispatchToAnalyzer(jsonPath);

      const convIds = conversations.map((c) => c._id);
      await closeConversationsById(convIds, now);
    } catch (error) {
      console.error(
        "Error en limpieza automática de conversaciones:",
        error.message
      );
    }
  });
};
