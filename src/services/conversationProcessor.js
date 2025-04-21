import Conversation from "../models/Conversation.js";

/**
 * Actualiza el estado de una conversación
 * @param {string} conversationId
 * @param {string} status
 */
export const updateConversationStatus = async (conversationId, status) => {
  await Conversation.findOneAndUpdate(
    { conversationId },
    {
      status,
      ...(status === "resolved" && { endTime: new Date() }),
      lastUpdated: new Date(),
    },
  );
};
