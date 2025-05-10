import {
  findOpenConversation,
  shouldCloseConversation,
  closeConversation,
  updateTimestamp,
  createNewConversation,
} from "./helpers/conversation.helpers.js";
import Conversation from "../../models/Conversation.js";

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
 * Busca las conversaciones de un agente específico, filtradas por usuario.
 * @param {string} userId - ID del usuario autenticado
 * @param {string} agentPhoneNumberId - ID del número del agente
 * @returns {Promise<Conversation[]>}
 */
export const findConversationsByAgent = async (userId, agentPhoneNumberId) => {
  return Conversation.find({ userId, agentPhoneNumberId })
    .sort({ lastUpdated: -1 })
    .select("-__v");
};
