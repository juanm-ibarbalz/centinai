import Message from "../../models/Message.js";
import { createOrUpdateConversation } from "../processors/conversationProcessor.js";
import { parseIncomingMessage } from "../parseIncomingMessage.js";

export const saveIncomingMessage = async (body) => {
  const parsedMessage = parseIncomingMessage(body);
  if (!parsedMessage) return;

  const { conversationId, from, userName } = parsedMessage;
  await createOrUpdateConversation(conversationId, from, userName);

  await Message.create(parsedMessage);
};
