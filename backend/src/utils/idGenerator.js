import { v4 as uuidv4 } from "uuid";
import { idConfig } from '../config/config.js';



export const generateConversationId = (userId, agentId) => {
  return `${idConfig.conversationPrefix}-${userId}-${agentId}-${uuidv4()}`;
};

export const generateAgentId = (userId) => {
  return `${idConfig.agentPrefix}-${userId}-${uuidv4()}`;
};

export const generateUserId = () => {
  return `${idConfig.userPrefix}-${uuidv4()}`;
};

export const generateMessageId = (conversationId) => {
  return `${idConfig.messagePrefix}-${conversationId}-${uuidv4()}`;
};
