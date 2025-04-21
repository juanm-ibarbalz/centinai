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

/**
 * Crea o actualiza una conversación cuando llega un nuevo mensaje
 */
export const createOrUpdateConversation = async (
  conversationId,
  from,
  userName,
) => {
  const existing = await Conversation.findOne({ conversationId });

  if (existing) {
    await Conversation.updateOne(
      { conversationId },
      { $set: { lastUpdated: new Date() } },
    );
  } else {
    await Conversation.create({
      conversationId,
      from,
      userName,
      status: "active",
      startTime: new Date(),
      lastUpdated: new Date(),
    });
  }
};
