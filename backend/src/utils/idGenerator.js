import { v4 as uuidv4 } from "uuid";

export const generateConversationId = (userId, agentId) => {
  return `conv-${userId}-${agentId}-${uuidv4()}`;
};

export const generateAgentId = (userId) => {
  return `agt-${userId}-${uuidv4()}`;
};

export const generateUserId = () => {
  return `usr-${uuidv4()}`;
};

export const generateMessageId = (conversationId) => {
  return `msg-${conversationId}-${uuidv4()}`;
};
