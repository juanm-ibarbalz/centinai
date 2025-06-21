import { v4 as uuidv4 } from "uuid";
import { idConfig } from "../config/config.js";

/**
 * Generates a unique conversation ID by combining prefix, user number, agent ID, and UUID.
 * Creates a human-readable identifier that includes context about the conversation participants.
 *
 * @param {string} from - User's phone number or identifier
 * @param {string} agentId - Agent's phone number ID or identifier
 * @returns {string} Unique conversation identifier
 */
export const generateConversationId = (from, agentId) => {
  return `${idConfig.conversationPrefix}-${from}-${agentId}-${uuidv4()}`;
};

/**
 * Generates a unique agent ID by combining prefix, user ID, and UUID.
 * Creates an identifier that links the agent to its owner user.
 *
 * @param {string} userId - ID of the user who owns the agent
 * @returns {string} Unique agent identifier
 */
export const generateAgentId = (userId) => {
  return `${idConfig.agentPrefix}-${userId}-${uuidv4()}`;
};

/**
 * Generates a unique user ID using prefix and UUID.
 * Creates a simple but unique identifier for user accounts.
 *
 * @returns {string} Unique user identifier
 */
export const generateUserId = () => {
  return `${idConfig.userPrefix}-${uuidv4()}`;
};

/**
 * Generates a unique message ID based on the associated conversation ID.
 * Creates an identifier that links the message to its conversation context.
 *
 * @param {string} conversationId - ID of the conversation this message belongs to
 * @returns {string} Unique message identifier
 */
export const generateMessageId = (conversationId) => {
  return `${idConfig.messagePrefix}-${conversationId}-${uuidv4()}`;
};

/**
 * Generates a unique session ID for temporary data or processing sessions.
 * Used for batch operations and temporary data storage.
 *
 * @returns {string} Unique session identifier
 */
export const generateSessionId = () => {
  return `${idConfig.sessionPrefix}-${uuidv4()}`;
};

/**
 * Generates a unique batch ID for grouping related operations.
 * Used for bulk operations like conversation exports and analysis jobs.
 *
 * @returns {string} Unique batch identifier
 */
export const generateBatchId = () => {
  return `${idConfig.batchPrefix}-${uuidv4()}`;
};
