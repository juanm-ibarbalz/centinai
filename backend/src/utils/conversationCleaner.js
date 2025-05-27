import cron from "node-cron";
import Conversation from "../models/Conversation.js";
import { conversationConfig } from "../config/config.js";
import { exportConversationsToJson } from "./exportConversationsToJson.js";

/**
 * Cierra las conversaciones vencidas por timeout.
 * Luego, las manda a exportar.
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
    return;
  }

  const convIds = conversationsToClose.map((c) => c._id);

  await Conversation.updateMany(
    { _id: { $in: convIds } },
    { $set: { status: "closed", endTime: now } },
  );

  if (conversationsToClose.length > 0) {
    const jsonPath = exportConversationsToJson(conversationsToClose);
    //exec(`python3 analyzer.py --batchFile="${jsonPath}"`); llamaría al archivo del analyzer
  }

  console.log(`🧹 ${convIds.length} conversaciones cerradas por timeout.`);
};

/**
 * Inicia el job periódico que ejecuta el cierre de conversaciones.
 * No hace más nada, solo cierra y devuelve las que cerró.
 */
export const startConversationCleanupJob = () => {
  const intervalMinutes = conversationConfig.cleanupIntervalMinutes;

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    try {
      await closeExpiredConversations();
    } catch (error) {
      console.error(
        "❌ Error en limpieza automática de conversaciones:",
        error,
      );
    }
  });
};
