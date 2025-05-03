import Message from "../../models/Message.js";
import Agent from "../../models/Agent.js";
import { createOrUpdateConversation } from "./conversation.service.js";
import { parseIncomingMessage } from "../mappers/message.mapper.js";
import { generateMessageId } from "../../utils/idGenerator.js";

export const saveIncomingMessage = async (body) => {
  const parsed = parseIncomingMessage(body);
  if (!parsed) return;

  const agent = await findAgentByPhoneNumber(parsed);
  if (!agent) return;

  const messageDoc = buildMessage(parsed, agent.userId);

  await createOrUpdateConversation(
    agent.userId,
    getPhoneNumberId(parsed),
    messageDoc,
  );

  messageDoc.messageId = generateMessageId(messageDoc.conversationId);
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

const buildMessage = (parsed, userId) => {
  const { from, recipient_id, timestamp, userName, direction, type, text } =
    parsed;

  return new Message({
    from,
    recipient_id,
    timestamp: new Date(Number(timestamp) * 1000),
    userName: userName || null,
    direction,
    type,
    text,
    status: "active",
    userId,
  });
};
