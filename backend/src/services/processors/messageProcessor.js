import Message from "../../models/Message.js";
import { createOrUpdateConversation } from "./conversationProcessor.js";
import { parseIncomingMessage } from "../parseIncomingMessage.js";

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

  const userId = direction === "user" ? from : recipient_id;
  const realAgentId = direction === "user" ? agentId : from;
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
  });

  // Gestionar conversación
  await createOrUpdateConversation(userId, realAgentId, messageDoc);
};
