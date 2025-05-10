import Conversation from "../../models/Conversation.js";
import { createOrUpdateConversation } from "./conversation.service.js";
import { parseIncomingMessage } from "../mappers/message.mapper.js";
import {
  getAgentPhoneNumberId,
  findAgentByPhoneNumber,
  buildMessage,
} from "./helpers/message.helpers.js";

/**
 * Procesa y guarda un mensaje entrante desde WhatsApp (usuario o agente).
 * @param {Object} body - Payload completo del webhook
 * @returns {Promise<void>}
 */
export const saveIncomingMessage = async (body) => {
  try {
    const parsed = parseIncomingMessage(body);
    if (!parsed) return;

    const agent = await findAgentByPhoneNumber(parsed);
    if (!agent) return;

    if (parsed.direction === "agent") {
      return await processAgentMessage(parsed, agent);
    }

    return await processUserMessage(parsed, agent);
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
    const agentPhoneNumberId = getAgentPhoneNumberId(parsed);

    const existingConversation = await Conversation.findOne({
      agentPhoneNumberId,
      from: parsed.recipient_id,
      status: "open",
    });

    if (!existingConversation) {
      console.warn("Mensaje del agente sin conversación activa. Ignorado.");
      return;
    }

    const messageDoc = buildMessage(
      parsed,
      agent.userId,
      existingConversation._id,
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
    const agentPhoneNumberId = getAgentPhoneNumberId(parsed);
    const from = parsed.from;

    const conversationId = await createOrUpdateConversation(
      agent.userId,
      agentPhoneNumberId,
      parsed.userName,
      from,
    );

    const messageDoc = buildMessage(parsed, agent.userId, conversationId);
    await messageDoc.save();
  } catch (err) {
    console.error("Error procesando mensaje del usuario:", err);
  }
};
