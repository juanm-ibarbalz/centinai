import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { createOrUpdateConversation } from "./conversation.service.js";
import { buildMessage } from "./helpers/message.helpers.js";

/**
 * Procesa y guarda un mensaje entrante desde el webhook.
 * @param {Object} parsed - Objeto de mensaje adaptado desde webhook
 */
export const saveIncomingMessage = async (parsed) => {
  if (parsed.direction === "agent") {
    await processAgentMessage(parsed);
  } else {
    await processUserMessage(parsed);
  }
};

/**
 * Procesa un mensaje enviado por un agente (message_echo).
 * Lo guarda solo si hay una conversación abierta.
 * @param {Object} parsed - Mensaje mapeado
 * @throws {Error} Si no hay una conversación activa para el mensaje del agente
 */
const processAgentMessage = async (parsed) => {
  const existingConversation = await Conversation.findOne({
    agentPhoneNumberId: parsed.agentPhoneNumberId,
    from: parsed.to,
    status: "open",
  });

  if (!existingConversation) {
    const err = new Error(
      "Agent message without an active conversation. Ignored."
    );
    err.status = 400;
    throw err;
  }

  const messageDoc = buildMessage(parsed, existingConversation._id);
  await messageDoc.save();
};

/**
 * Procesa un mensaje entrante desde un usuario externo.
 * Crea o actualiza una conversación y guarda el mensaje.
 * @param {Object} parsed - Mensaje mapeado
 */
const processUserMessage = async (parsed) => {
  const conversationId = await createOrUpdateConversation(
    parsed.userId,
    parsed.agentPhoneNumberId,
    parsed.userName,
    parsed.from
  );

  const messageDoc = buildMessage(parsed, conversationId);
  await messageDoc.save();
};

/**
 * Obtiene mensajes de una conversación perteneciente al usuario, con paginación.
 * Lanza error si la conversación no existe o no pertenece al usuario autenticado.
 * @param {string} conversationId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Array>}
 */
export const getMessagesByConversationId = async (
  conversationId,
  userId,
  limit,
  offset
) => {
  return await Message.find({ conversationId, userId })
    .sort({ timestamp: 1 })
    .skip(offset)
    .limit(limit);
};
