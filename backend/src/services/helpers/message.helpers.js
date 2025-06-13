import Message from "../../models/Message.js";
import { generateMessageId } from "../../utils/idGenerator.js";

/**
 * Construye un documento Message listo para guardar.
 * @param {Object} parsed - Objeto mapeado del mensaje
 * @param {string} conversationId - ID de la conversación asociada
 * @throws {Error} Si hay un error al generar el ID del mensaje
 * @returns {Message} - Documento listo para guardar
 */
export const buildMessage = (parsed, conversationId) => {
  const { from, timestamp, userName, direction, type, text, userId } = parsed;

  const generatedMessageId = generateMessageId(conversationId);
  if (generatedMessageId === null) {
    const err = new Error("Error generating message ID");
    err.status = 500;
    throw err;
  }

  return new Message({
    _id: generatedMessageId,
    from,
    timestamp: new Date(Number(timestamp) * 1000),
    userName,
    direction,
    type,
    text,
    status: "active",
    userId,
    conversationId,
  });
};
