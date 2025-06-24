import {
  findOpenConversation,
  closeConversation,
  updateTimestamp,
  createNewConversation,
  buildConversationMatchStage,
  buildConversationSortStage,
  buildConversationProjectStage,
  isExpired,
} from "./helpers/conversation.helpers.js";
import Conversation from "../models/Conversation.js";

/**
 * Creates a new conversation or updates an existing one,
 * closing the previous conversation if it has expired due to timeout.
 * Handles conversation lifecycle management for incoming messages.
 *
 * @param {string} userId - ID of the user who owns the conversation
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {string} userName - Display name of the user in the conversation
 * @param {string} from - Phone number or identifier of the message sender
 * @returns {Promise<string>} ID of the active conversation
 * @throws {Error} When there's an error creating or updating the conversation (status: 500)
 */
export const createOrUpdateConversation = async (
  userId,
  agentPhoneNumberId,
  userName,
  from
) => {
  const now = new Date();
  let conversation = await findOpenConversation(from, agentPhoneNumberId);

  if (isExpired(conversation, now)) {
    try {
      await closeConversation(conversation, now);
    } catch {
      const err = new Error("Error closing conversation");
      err.status = 500;
      throw err;
    }
    conversation = null;
  }

  if (!conversation) {
    try {
      conversation = await createNewConversation(
        userId,
        agentPhoneNumberId,
        userName,
        from
      );
    } catch {
      const err = new Error("Error creating new conversation");
      err.status = 500;
      throw err;
    }
  } else {
    try {
      await updateTimestamp(conversation, now);
    } catch {
      const err = new Error("Error updating conversation timestamp");
      err.status = 500;
      throw err;
    }
  }

  return conversation._id;
};

/**
 * Retrieves conversations for a specific user and agent with advanced filtering,
 * pagination, sorting, and date range filtering. Includes metrics data through
 * MongoDB aggregation pipeline for performance optimization.
 *
 * @param {string} userId - ID of the user whose conversations to retrieve
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {Object} options - Query options for filtering and pagination
 * @param {number} options.limit - Maximum number of conversations to return
 * @param {number} options.offset - Number of conversations to skip for pagination
 * @param {'duration'|'cost'|'date'} [options.sortBy='date'] - Field to sort by
 * @param {'asc'|'desc'} [options.sortOrder='desc'] - Sort order (ascending or descending)
 * @param {Date} [options.dateFrom] - Start date for filtering conversations
 * @param {Date} [options.dateTo] - End date for filtering conversations
 * @returns {Promise<Array>} Array of conversation objects with embedded metrics data
 */
export const findConversationsByAgent = async (
  userId,
  agentPhoneNumberId,
  { limit, offset, sortBy, sortOrder, dateFrom, dateTo }
) => {
  // 1) Stage $match
  const matchStage = buildConversationMatchStage(
    userId,
    agentPhoneNumberId,
    dateFrom,
    dateTo
  );

  // 2) Stage $lookup
  // Lookup contra la colección "metrics" (modelo Metric) para traer durationSeconds y tokenUsage.cost
  // LEFT JOIN metrics m ON m.conversation_id = c.id AND m.user_id = :userId (y seleccionar columnas m.duration_seconds, m.token_usage_cost en el SELECT)
  const lookupStage = {
    $lookup: {
      from: "metrics",
      let: { convId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$conversationId", "$$convId"] },
                { $eq: ["$userId", userId] },
              ],
            },
          },
        },
        { $project: { _id: 0, durationSeconds: 1, "tokenUsage.cost": 1 } },
      ],
      as: "metrics",
    },
  };

  // 3) Stage $unwind (fijo)
  // Hacemos unwind para simplificar
  // Convierte “metrics” en un objeto simple en lugar de array.
  const unwindStage = {
    $unwind: { path: "$metrics", preserveNullAndEmptyArrays: true },
  };

  // 4) Stage $sort
  const sortStage = buildConversationSortStage(sortBy, sortOrder);

  // 5) Stages $skip y $limit
  const skipStage = { $skip: offset };
  const limitStage = { $limit: limit };

  // 6) Stage $project
  const projectStage = buildConversationProjectStage();

  // 7) Armamos el pipeline completo
  const pipeline = [
    matchStage,
    lookupStage,
    unwindStage,
    sortStage,
    skipStage,
    limitStage,
    projectStage,
  ];

  return await Conversation.aggregate(pipeline);
};
