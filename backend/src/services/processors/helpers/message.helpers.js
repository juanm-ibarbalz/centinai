import Agent from "../../../models/Agent.js";
import Message from "../../../models/Message.js";
import { generateMessageId } from "../../../utils/idGenerator.js";

/**
 * Determina el phoneNumberId del agente según el sentido del mensaje.
 * @param {Object} parsed - Objeto mapeado del mensaje
 * @returns {string} - phoneNumberId
 */
export const getAgentPhoneNumberId = ({
  direction,
  agentPhoneNumberId,
  from,
}) => (direction === "user" ? agentPhoneNumberId : from);

/**
 * Busca un agente a partir de su phoneNumberId extraído del mensaje.
 * @param {Object} parsed - Objeto mapeado del mensaje
 * @returns {Promise<Agent|null>}
 */
export const findAgentByPhoneNumber = async (parsed) => {
  const phoneNumberId = getAgentPhoneNumberId(parsed);
  const agent = await Agent.findOne({ phoneNumberId });

  if (!agent) {
    console.warn(`Agente no encontrado para phoneNumberId: ${phoneNumberId}`);
  }

  return agent;
};

/**
 * Construye un documento Message listo para guardar.
 * @param {Object} parsed - Objeto mapeado del mensaje
 * @param {string} userId - ID del usuario dueño del agente
 * @param {string} conversationId - ID de la conversación asociada
 * @returns {Message} - Documento listo para guardar
 */
export const buildMessage = (parsed, userId, conversationId) => {
  const { from, recipient_id, timestamp, userName, direction, type, text } =
    parsed;

  return new Message({
    _id: generateMessageId(conversationId),
    from,
    recipient_id,
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
