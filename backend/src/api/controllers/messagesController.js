import { getMessagesByConversationId } from "../../services/message.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import { listMessagesQuerySchema } from "../../validators/message.validator.js";
import Conversation from "../../models/Conversation.js";

/**
 * Lists messages for a specific conversation with pagination support.
 * Verifies that the conversation belongs to the authenticated user before
 * returning the messages.
 *
 * @route GET /messages
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.conversationId - Unique identifier of the conversation
 * @param {number} [req.query.limit=50] - Maximum number of messages to return
 * @param {number} [req.query.offset=0] - Number of messages to skip for pagination
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with paginated messages array
 * @throws {400} When query parameters validation fails
 * @throws {404} When conversation is not found or doesn't belong to user
 * @throws {500} When server error occurs during message retrieval
 */
export const listMessages = async (req, res) => {
  const parsed = listMessagesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_query", parsed.error);
  }

  const { conversationId, limit, offset } = parsed.data;
  const userId = req.user.id;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });
  if (!conversation) return sendError(res, 404, "conversation_not_found");

  try {
    const messages = await getMessagesByConversationId(
      conversationId,
      userId,
      limit,
      offset
    );
    return sendSuccess(res, 200, { messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
