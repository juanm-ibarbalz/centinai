import cron from "node-cron";
import Conversation from "../../models/Conversation.js";
import { conversationConfig } from "../../config/config.js";
import {
  buildExportPayloads,
  exportConversationsToJson,
} from "./exportConversations.js";
import { dispatchToAnalyzer } from "./analyzerDispatcher.js";

/**
 * Obtiene las conversaciones vencidas por timeout.
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
 * Cierra las conversaciones por sus IDs.
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
 * Inicia el job periódico que ejecuta el cierre de conversaciones,
 * las prepara para análisis y despacha al analyzer.
 */
export const startConversationCleanupJob = () => {
  const intervalMinutes = conversationConfig.cleanupIntervalMinutes;

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    try {
      const conversations = await getExpiredConversations();
      if (conversations.length === 0) return;

      const payloads = await buildExportPayloads(conversations);
      const jsonPath = exportConversationsToJson(payloads);
      await dispatchToAnalyzer(jsonPath);

      const convIds = conversations.map((c) => c._id);
      await closeConversationsById(convIds);
    } catch (error) {
      console.error("Error en limpieza automática de conversaciones:", error);
    }
  });
};
