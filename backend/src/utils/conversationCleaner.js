import cron from "node-cron";
import Conversation from "../models/Conversation.js";
import { conversationConfig } from "../config/config.js";

export const startConversationCleanupJob = () => {
  const intervalMinutes = conversationConfig.cleanupIntervalMinutes;

  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    const now = new Date();
    const timeoutLimit = new Date(now.getTime() - conversationConfig.timeoutMs);

    try {
      const result = await Conversation.updateMany(
        {
          status: conversationConfig.defaultConversationStatus,
          updatedAt: { $lt: timeoutLimit },
        },
        {
          status: "closed",
          endTime: now,
        },
      );

      if (result.modifiedCount > 0) {
        console.log(
          `🧹 ${result.modifiedCount} conversaciones cerradas por timeout automático.`,
        );
      }
    } catch (error) {
      console.error(
        "❌ Error en limpieza automática de conversaciones:",
        error,
      );
    }
  });
};
