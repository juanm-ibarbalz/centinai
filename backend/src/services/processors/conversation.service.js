import {
  findOpenConversation,
  shouldCloseConversation,
  closeConversation,
  updateTimestamp,
  createNewConversation,
} from "./conversation.helpers.js";

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
