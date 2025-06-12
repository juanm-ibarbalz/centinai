import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { createOrUpdateConversation } from "./conversation.service.js";
import { buildMessage } from "./helpers/message.helpers.js";

/**
 * Procesa y guarda un mensaje entrante desde el webhook.
 * @param {Object} parsed - Objeto de mensaje adaptado desde webhook
 * @param {Object} agent - Documento del agente asociado
 * @returns {Promise<void>}
 */
export const saveIncomingMessage = async (parsed, agent) => {
  if (!parsed) return;
  if (!agent) return;

  try {
    if (parsed.direction === "agent") {
      await processAgentMessage(parsed, agent);
    }
    await processUserMessage(parsed, agent);
  } catch (err) {
    console.error("Error procesando mensaje entrante:", err);
  }
};

/**
 * Procesa un mensaje enviado por un agente (message_echo).
 * Lo guarda solo si hay una conversación abierta.
 * @param {Object} parsed - Mensaje mapeado
 * @param {Object} agent - Documento Agent
 * @returns {Promise<void>}
 */
const processAgentMessage = async (parsed, agent) => {
  try {
    const existingConversation = await Conversation.findOne({
      agentPhoneNumberId: parsed.agentPhoneNumberId,
      from: parsed.to,
      status: "open",
    });

    if (!existingConversation) {
      console.warn("Mensaje del agente sin conversación activa. Ignorado.");
      return;
    }

    const messageDoc = buildMessage(
      parsed,
      agent.userId,
      existingConversation._id
    );
    await messageDoc.save();
  } catch (err) {
    console.error("Error procesando mensaje del agente:", err);
  }
};

/**
 * Procesa un mensaje entrante desde un usuario externo.
 * Crea o actualiza una conversación y guarda el mensaje.
 * @param {Object} parsed - Mensaje mapeado
 * @param {Object} agent - Documento Agent
 * @returns {Promise<void>}
 */
const processUserMessage = async (parsed, agent) => {
  try {
    const conversationId = await createOrUpdateConversation(
      agent.userId,
      parsed.agentPhoneNumberId,
      parsed.userName,
      parsed.from
    );

    const messageDoc = buildMessage(parsed, agent.userId, conversationId);
    await messageDoc.save();
  } catch (err) {
    console.error("Error procesando mensaje del usuario:", err);
  }
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
