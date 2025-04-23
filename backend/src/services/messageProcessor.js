import Message from "../models/Message.js";
import { createOrUpdateConversation } from "./conversationProcessor.js";
import { parseIncomingMessage } from "../utils/messageParser.js";

export const saveIncomingMessage = async (body) => {
  const parsedMessage = parseIncomingMessage(body);
  if (!parsedMessage) return;

  const { conversationId, from, userName } = parsedMessage;
  await createOrUpdateConversation(conversationId, from, userName);

  await Message.create(parsedMessage);
};
