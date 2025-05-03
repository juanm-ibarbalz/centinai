import Message from "../../models/Message.js";
import Agent from "../../models/Agent.js";
import { createOrUpdateConversation } from "./conversation.service.js";
import { parseIncomingMessage } from "../mappers/message.mapper.js";

export const saveIncomingMessage = async (body) => {
  const parsedMessage = parseIncomingMessage(body);
  if (!parsedMessage) return;

  const {
    from,
    recipient_id,
    timestamp,
    userName,
    direction,
    type,
    text,
    agentId,
  } = parsedMessage;

  const realAgentId = direction === "user" ? agentId : from;

  const agent = await Agent.findOne({ phoneNumberId: realAgentId });
  if (!agent) {
    console.warn("Agente no encontrado para phoneNumberId:", realAgentId);
    console.warn(
      `Mensaje ignorado: phoneNumberId sin agente asignado → ${realAgentId}`,
    );
    return;
  }

  const userId = agent.userId;
  const messageTimestamp = new Date(Number(timestamp) * 1000);

  // Guardar mensaje individual
  const messageDoc = await Message.create({
    messageId: parsedMessage.messageId,
    timestamp: messageTimestamp,
    from: from,
    userName: userName || null,
    direction: direction,
    type: type,
    text: text,
    status: "active",
    userId,
  });

  // Gestionar conversación
  await createOrUpdateConversation(userId, realAgentId, messageDoc);
};
