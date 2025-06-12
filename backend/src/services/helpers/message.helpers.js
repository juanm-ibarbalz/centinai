import Message from "../../models/Message.js";
import { generateMessageId } from "../../utils/idGenerator.js";

/**
 * Construye un documento Message listo para guardar.
 * @param {Object} parsed - Objeto mapeado del mensaje
 * @param {string} userId - ID del usuario dueño del agente
 * @param {string} conversationId - ID de la conversación asociada
 * @returns {Message} - Documento listo para guardar
 */
export const buildMessage = (parsed, userId, conversationId) => {
  const { from, timestamp, userName, direction, type, text } = parsed;

  return new Message({
    _id: generateMessageId(conversationId),
    from,
    timestamp: new Date(Number(timestamp) * 1000),
    userName: userName || null,
    direction,
    type,
    text,
    status: "active",
    userId,
    conversationId,
  });
};
