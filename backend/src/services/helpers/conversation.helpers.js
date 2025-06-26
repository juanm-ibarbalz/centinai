import Conversation from "../../models/Conversation.js";
import { conversationConfig } from "../../config/config.js";
import { generateConversationId } from "../../utils/idGenerator.js";

const TIMEOUT = conversationConfig.timeoutMs;

/**
 * Finds an open conversation by customer phone number and agent.
 * Returns the most recently updated conversation if multiple exist.
 *
 * @param {string} from - Customer's phone number
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @returns {Promise<Object|null>} Open conversation object or null if not found
 */
export const findOpenConversation = async (from, agentPhoneNumberId) => {
  return Conversation.findOne({
    from,
    agentPhoneNumberId,
    status: conversationConfig.defaultConversationStatus,
  }).sort({ updatedAt: -1 });
};

/**
 * Determines if a conversation has expired due to inactivity.
 * Compares the conversation's last update time against the configured timeout.
 *
 * @param {Object} conversation - Conversation object to evaluate
 * @param {Date} conversation.updatedAt - Last update timestamp of the conversation
 * @param {Date} now - The timestamp of the new message for comparison
 * @returns {boolean} True if conversation has expired, false otherwise
 */
export function isExpired(conversation, now) {
  if (!conversation) return false;
  return now.getTime() - conversation.updatedAt.getTime() > TIMEOUT;
}

/**
 * Closes an active conversation by setting status to "closed".
 * The updatedAt field is INTENTIONALLY NOT modified here.
 * It should retain the timestamp of the last actual message.
 *
 * @param {Object} conversation - Conversation object to close
 * @returns {Promise<void>} Resolves when conversation is successfully closed
 */
export const closeConversation = async (conversation) => {
  conversation.status = conversationConfig.closingConversationStatus;
  await conversation.save();
};

/**
 * Updates the timestamp of an existing conversation.
 * Refreshes the updatedAt field to extend the conversation's active period.
 *
 * @param {Object} conversation - Conversation object to update
 * @param {Date} now - New timestamp for the conversation
 * @returns {Promise<void>} Resolves when timestamp is successfully updated
 */
export const updateTimestamp = async (conversation, now) => {
  conversation.updatedAt = now;
  await conversation.save();
};

/**
 * Creates a new conversation with the provided data.
 * Generates a unique conversation ID and sets initial status to "open".
 *
 * @param {string} userId - ID of the user who owns the conversation
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {string} userName - Display name of the user in the conversation
 * @param {string} from - Phone number of the customer starting the conversation
 * @param {Date} timestamp - Timestamp of the conversation creation
 * @returns {Promise<Object>} Newly created conversation object
 */
export const createNewConversation = async (
  userId,
  agentPhoneNumberId,
  userName,
  from,
  timestamp
) => {
  const generatedConversationId = generateConversationId(
    from,
    agentPhoneNumberId
  );

  const newConversation = new Conversation({
    _id: generatedConversationId,
    from,
    userId,
    userName,
    agentPhoneNumberId,
    status: conversationConfig.defaultConversationStatus,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await newConversation.save();
  return newConversation;
};

/**
 * Builds the $match stage for filtering conversations in MongoDB aggregation.
 * Creates a match filter based on user ID, agent phone number, and optional date range.
 *
 * SQL equivalent:
 * FROM conversations c
 * WHERE c.userId = userId
 *   AND c.agentPhoneNumberId = agentPN
 *   [AND c.createdAt >= dateFrom]
 *   [AND c.createdAt <= dateTo]
 *
 * @param {string} userId - ID of the authenticated user
 * @param {string} agentPN - WhatsApp phone number identifier of the agent
 * @param {Date} [dateFrom] - Minimum date (inclusive) for filtering
 * @param {Date} [dateTo] - Maximum date (inclusive) for filtering
 * @returns {Object} MongoDB aggregation $match stage
 */
export function buildConversationMatchStage(userId, agentPN, dateFrom, dateTo) {
  const match = { userId, agentPhoneNumberId: agentPN };
  if (dateFrom && dateTo) {
    match.createdAt = { $gte: dateFrom, $lte: dateTo };
  } else if (dateFrom) {
    match.createdAt = { $gte: dateFrom };
  } else if (dateTo) {
    match.createdAt = { $lte: dateTo };
  }
  return { $match: match };
}

/**
 * Builds the $sort stage for ordering conversation results.
 * Supports sorting by duration, cost, or date with ascending or descending order.
 *
 * @param {'duration'|'cost'|'date'} [sortBy='date'] - Field to sort by: duration, cost, or date
 * @param {'asc'|'desc'} [sortOrder='desc'] - Sort order: ascending or descending
 * @returns {Object} MongoDB aggregation $sort stage
 */
export function buildConversationSortStage(sortBy, sortOrder = "desc") {
  const dir = sortOrder === "asc" ? 1 : -1;
  // Orden prioritario: duration → cost → date
  if (sortBy === "duration") {
    return { $sort: { "metrics.durationSeconds": dir } };
  } else if (sortBy === "cost") {
    return { $sort: { "metrics.tokenUsage.cost": dir } };
  } else {
    return { $sort: { createdAt: dir } };
  }
}

/**
 * Builds the $project stage for selecting specific fields in aggregation results.
 * Returns only essential conversation and metrics fields for performance optimization.
 *
 * SQL equivalent:
 * SELECT c.id, c.created_at, m.duration_seconds, m.token_usage_cost
 *
 * @returns {Object} MongoDB aggregation $project stage
 */
export function buildConversationProjectStage() {
  return {
    $project: {
      _id: 1,
      userName: 1,
      from: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
      "metrics.durationSeconds": 1,
      "metrics.tokenUsage.cost": 1,
    },
  };
}
