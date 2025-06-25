import Message from "../../models/Message.js";

/**
 * Construye los payloads de exportación que contienen la conversación y sus mensajes asociados.
 * Recupera todos los mensajes para cada conversación y los estructura para el análisis.
 *
 * @param {Array<Object>} conversations - Objetos de conversación ya recuperados de la base de datos
 * @returns {Promise<Array<Object>>} Array de objetos con conversación y mensajes para exportar (en memoria)
 */
export const buildExportPayloads = async (conversations) => {
  const payloads = [];

  for (const conv of conversations) {
    const messages = await Message.find({ conversationId: conv._id })
      .sort({ timestamp: 1 })
      .lean();

    payloads.push({ conversation: conv, messages });
  }

  return payloads;
};
