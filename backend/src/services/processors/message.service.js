import Message from "../../models/Message.js";
import Agent from "../../models/Agent.js";
import { createOrUpdateConversation } from "./conversation.service.js";
import { parseIncomingMessage } from "../mappers/message.mapper.js";
import { generateMessageId } from "../../utils/idGenerator.js";
import Conversation from "../../models/Conversation.js"; // necesario solo para echo

export const saveIncomingMessage = async (body) => {
  const parsed = parseIncomingMessage(body);
  if (!parsed) return;

  const agent = await findAgentByPhoneNumber(parsed);
  if (!agent) return;

  const agentId = getPhoneNumberId(parsed);
  const from = parsed.from;

  if (parsed.direction === "agent") {
    // Buscamos una conversación abierta ya existente
    const existingConversation = await Conversation.findOne({
      agentId,
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
    return;
  }

  // Usuario externo: crear o actualizar conversación
  const conversationId = await createOrUpdateConversation(
    agent.userId,
    agentId,
    parsed.userName,
    from,
  );

  const messageDoc = buildMessage(parsed, agent.userId, conversationId);
  await messageDoc.save();
};

const getPhoneNumberId = ({ direction, agentId, from }) =>
  direction === "user" ? agentId : from;

const findAgentByPhoneNumber = async (parsed) => {
  const phoneNumberId = getPhoneNumberId(parsed);
  const agent = await Agent.findOne({ phoneNumberId });

  if (!agent) {
    console.warn(`Agente no encontrado para phoneNumberId: ${phoneNumberId}`);
  }

  return agent;
};

const buildMessage = (parsed, userId, conversationId) => {
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
