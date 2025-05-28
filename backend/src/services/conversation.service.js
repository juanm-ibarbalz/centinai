import {
  findOpenConversation,
  shouldCloseConversation,
  closeConversation,
  updateTimestamp,
  createNewConversation,
} from "./helpers/conversation.helpers.js";
import Conversation from "../models/Conversation.js";

/**
 * Crea una nueva conversación o actualiza una existente,
 * cerrando la anterior si ya venció el timeout.
 * @param {string} userId - ID del usuario que envía el mensaje
 * @param {string} agentPhoneNumberId - Número de teléfono del agente
 * @param {string} userName - Nombre del usuario
 * @param {string} from - Identificador del remitente (número de teléfono del cliente)
 * @returns {Promise<string>} - ID de la conversación activa
 */
export const createOrUpdateConversation = async (
  userId,
  agentPhoneNumberId,
  userName,
  from,
) => {
  const now = new Date();
  const conversation = await findOpenConversation(from, agentPhoneNumberId);

  if (shouldCloseConversation(conversation, now)) {
    if (conversation) await closeConversation(conversation);
    return await createNewConversation(
      userId,
      agentPhoneNumberId,
      userName,
      from,
    );
  }

  await updateTimestamp(conversation);
  return conversation._id;
};

/**
 * Busca las conversaciones del usuario para un agente específico, con paginación.
 * @param {string} userId - ID del usuario autenticado
 * @param {string} agentPhoneNumberId - ID del agente (phone_number_id)
 * @param {number} limit - Cantidad máxima de resultados a devolver
 * @param {number} offset - Cantidad de resultados a saltear
 * @returns {Promise<Array>} - Lista de conversaciones
 */
export const findConversationsByAgent = async (
  userId,
  agentPhoneNumberId,
  limit,
  offset,
) => {
  return await Conversation.find({ userId, agentPhoneNumberId })
    .sort({ lastUpdated: -1 })
    .skip(offset)
    .limit(limit);
};
