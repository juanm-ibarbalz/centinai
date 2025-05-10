import Conversation from "../../../models/Conversation.js";
import { conversationConfig } from "../../../config/config.js";
import { generateConversationId } from "../../../utils/idGenerator.js";

const TIMEOUT = conversationConfig.timeoutMs;

/**
 * Busca una conversación abierta por número del cliente y agente.
 * @param {string} from - Número de teléfono del cliente
 * @param {string} agentPhoneNumberId - Número de teléfono del agente
 * @returns {Promise<Conversation|null>}
 */
export const findOpenConversation = async (from, agentPhoneNumberId) => {
  return Conversation.findOne({
    from,
    agentPhoneNumberId,
    status: "open",
  }).sort({ updatedAt: -1 });
};

/**
 * Determina si una conversación ya venció por tiempo de inactividad.
 * @param {Conversation|null} conversation
 * @param {Date} now - Fecha actual
 * @returns {boolean}
 */
export const shouldCloseConversation = (conversation, now) => {
  if (!conversation) return true;
  return now - conversation.updatedAt > TIMEOUT;
};

/**
 * Cierra una conversación activa, marcando endTime.
 * @param {Conversation} conversation
 * @returns {Promise<void>}
 */
export const closeConversation = async (conversation) => {
  try {
    conversation.status = "closed";
    conversation.endTime = new Date();
    await conversation.save();
  } catch (err) {
    console.error("Error cerrando conversación:", err);
    throw err;
  }
};

/**
 * Actualiza el timestamp de una conversación existente.
 * @param {Conversation} conversation
 * @returns {Promise<void>}
 */
export const updateTimestamp = async (conversation) => {
  try {
    conversation.lastUpdated = new Date();
    await conversation.save();
  } catch (err) {
    console.error("Error actualizando conversación:", err);
    throw err;
  }
};

/**
 * Crea una nueva conversación con los datos proporcionados.
 * @param {string} userId
 * @param {string} agentPhoneNumberId
 * @param {string} userName
 * @param {string} from
 * @returns {Promise<string>} - ID de la conversación creada
 */
export const createNewConversation = async (
  userId,
  agentPhoneNumberId,
  userName,
  from,
) => {
  try {
    const conversationId = generateConversationId(from, agentPhoneNumberId);

    const newConversation = new Conversation({
      _id: conversationId,
      from,
      userId,
      userName,
      agentPhoneNumberId,
      status: "open",
      startTime: new Date(),
      lastUpdated: new Date(),
    });

    await newConversation.save();
    return newConversation._id;
  } catch (err) {
    console.error("Error creando nueva conversación:", err);
    throw err;
  }
};
