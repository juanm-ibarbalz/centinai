import cron from "node-cron";
import Conversation from "../../models/Conversation.js";
import { conversationConfig } from "../../config/config.js";
import {
  buildExportPayloads,
  exportConversationsToJson,
} from "./exportConversations.js";
import { dispatchToAnalyzer } from "./analyzerDispatcher.js";

/**
 * Cierra las conversaciones vencidas por timeout y las devuelve.
 */
export const closeExpiredConversations = async () => {
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

  const convIds = conversationsToClose.map((c) => c._id);

  await Conversation.updateMany(
    { _id: { $in: convIds } },
    { $set: { status: "closed", endTime: now } },
  );

  console.log(`🧹 ${convIds.length} conversaciones cerradas por timeout.`);
  return conversationsToClose;
};

/**
 * Inicia el job periódico que ejecuta el cierre de conversaciones,
 * las prepara para análisis y despacha al analyzer.
 */
export const startConversationCleanupJob = () => {
  const intervalMinutes = conversationConfig.cleanupIntervalMinutes;

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    try {
      const conversations = await closeExpiredConversations();
      if (conversations.length === 0) return;

      const payloads = await buildExportPayloads(conversations);
      const jsonPath = exportConversationsToJson(payloads);
      dispatchToAnalyzer(jsonPath);
    } catch (error) {
      console.error(
        "❌ Error en limpieza automática de conversaciones:",
        error,
      );
    }
  });
};
