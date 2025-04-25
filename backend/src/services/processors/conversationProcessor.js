import Conversation from "../../models/Conversation.js";
import { v4 as uuidv4 } from "uuid";
import { conversationConfig } from "../../config/config.js";

const TIMEOUT = conversationConfig.conversationTimeoutMs;

// Función principal que coordina todo
export const createOrUpdateConversation = async (userId, agentId, message) => {
  const now = new Date();
  const conversation = await findOpenConversation(userId, agentId);

  if (shouldCloseConversation(conversation, now)) {
    if (conversation) {
      await closeConversation(conversation);
    }
    await createNewConversation(userId, agentId, message.userName, message);
  } else {
    await appendToExistingConversation(conversation, message);
  }
};

// Encuentra conversación abierta para usuario y agente
const findOpenConversation = async (userId, agentId) => {
  return Conversation.findOne({
    from: userId,
    agentId: agentId,
    status: "open",
  }).sort({ updatedAt: -1 });
};

// Decide si debe cerrarse la conversación por timeout
const shouldCloseConversation = (conversation, now) => {
  if (!conversation) return true;
  return now - conversation.updatedAt > TIMEOUT;
};

// Cierra una conversación existente
const closeConversation = async (conversation) => {
  conversation.status = "closed";
  conversation.endTime = new Date();
  await conversation.save();
};

// Crea una nueva conversación
const createNewConversation = async (userId, agentId, userName, message) => {
  const conversationId = `${userId}-${agentId}-${uuidv4()}`;

  const newConversation = new Conversation({
    conversationId,
    from: userId,
    userName,
    agentId,
    status: "open",
    startTime: new Date(),
    lastUpdated: new Date(),
  });

  await newConversation.save();

  // Actualizar conversationId en el mensaje
  message.conversationId = conversationId;
  await message.save();
};

// Agrega un mensaje a una conversación existente
const appendToExistingConversation = async (conversation, message) => {
  conversation.lastUpdated = new Date();
  await conversation.save();

  // Actualizar conversationId en el mensaje
  message.conversationId = conversation.conversationId;
  await message.save();
};
