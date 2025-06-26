import { findConversationsByAgent } from "../../services/conversation.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import { getConversationsQuerySchema } from "../../validators/conversation.validator.js";
import Agent from "../../models/Agent.js";

/**
 * Controller for retrieving conversations for a specific agent belonging to the authenticated user.
 * Supports pagination, sorting, and date range filtering.
 *
 * Features:
 *   • Pagination: limit, offset
 *   • Sorting: sortBy = duration | cost | date ; sortOrder = asc | desc
 *   • Date filtering: dateFrom, dateTo (ISO strings)
 *
 * @route GET /conversations?agentPhoneNumberId=xxx
 *                       &limit=20&offset=0
 *                       &sortBy=duration|cost|date
 *                       &sortOrder=asc|desc
 *                       &dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.agentPhoneNumberId - WhatsApp phone number identifier for the agent
 * @param {number} [req.query.limit=20] - Maximum number of conversations to return
 * @param {number} [req.query.offset=0] - Number of conversations to skip
 * @param {string} [req.query.sortBy='date'] - Field to sort by: 'duration', 'cost', or 'date'
 * @param {string} [req.query.sortOrder='desc'] - Sort order: 'asc' or 'desc'
 * @param {string} [req.query.dateFrom] - Start date for filtering (ISO string)
 * @param {string} [req.query.dateTo] - End date for filtering (ISO string)
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with paginated conversations data
 * @throws {400} When query parameters validation fails
 * @throws {404} When agent is not found or doesn't belong to user
 * @throws {500} When server error occurs during retrieval
 */
export const getConversationsByAgent = async (req, res) => {
  const parsed = getConversationsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_query", parsed.error);
  }

  const {
    agentPhoneNumberId,
    limit,
    offset,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
  } = parsed.data;

  const agent = await Agent.findOne({
    phoneNumberId: agentPhoneNumberId,
    userId: req.user.id,
  });
  if (!agent) return sendError(res, 404, "agent_not_found");

  try {
    const conversations = await findConversationsByAgent(
      req.user.id,
      agentPhoneNumberId,
      { limit, offset, sortBy, sortOrder, dateFrom, dateTo }
    );
    return sendSuccess(res, 200, conversations);
  } catch (err) {
    console.error("Error retrieving conversations:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
