import {
  findMetricsByAgent,
  findMetricByConversationIdAndUser,
  findMetricsByUser,
} from "../../services//metrics.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import {
  listMetricsQuerySchema,
  getMetricParamsSchema,
  listAllMetricsQuerySchema,
} from "../../validators/metrics.validator.js";

/**
 * Controller for retrieving metrics with optional agent filtering.
 * If `agentPhoneNumberId` is provided, returns metrics for that specific agent.
 * If not provided, returns all metrics for the authenticated user.
 *
 * @route GET /metrics?agentPhoneNumberId=xxx
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.agentPhoneNumberId] - Phone number identifier for filtering
 * @param {number} [req.query.limit=20] - Maximum number of metrics to return
 * @param {number} [req.query.offset=0] - Number of metrics to skip for pagination
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with paginated metrics data
 * @throws {400} When query parameters validation fails
 * @throws {500} When server error occurs during metrics retrieval
 */
export const getMetricsByAgentController = async (req, res) => {
  const parsed = listMetricsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_query", parsed.error);
  }

  const { agentPhoneNumberId, limit, offset } = parsed.data;
  const userId = req.user.id;

  try {
    const metrics = await findMetricsByAgent(
      userId,
      agentPhoneNumberId,
      limit,
      offset
    );
    return sendSuccess(res, 200, metrics);
  } catch (err) {
    console.error("Error retrieving metrics by agent:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Controller for retrieving all metrics for the authenticated user.
 * Returns metrics across all agents belonging to the user with pagination support.
 *
 * @route GET /metrics/all
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=20] - Maximum number of metrics to return
 * @param {number} [req.query.offset=0] - Number of metrics to skip for pagination
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with paginated metrics data for all user's agents
 * @throws {400} When query parameters validation fails
 * @throws {500} When server error occurs during metrics retrieval
 */
export const getMetricsByUserController = async (req, res) => {
  const parsed = listAllMetricsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_query", parsed.error);
  }

  const { limit, offset } = parsed.data;
  const userId = req.user.id;

  try {
    const metrics = await findMetricsByUser(userId, limit, offset);
    return sendSuccess(res, 200, metrics);
  } catch (err) {
    console.error("Error retrieving metrics by user:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Controller for retrieving metrics for a specific conversation.
 * Verifies that the conversation belongs to the authenticated user before
 * returning the metrics data.
 *
 * @route GET /metrics/:conversationId
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.conversationId - Unique identifier of the conversation
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with conversation metrics data
 * @throws {400} When URL parameters validation fails
 * @throws {404} When conversation is not found or doesn't belong to user
 * @throws {500} When server error occurs during metrics retrieval
 */
export const getMetricByConversationController = async (req, res) => {
  const parsedParams = getMetricParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return sendError(res, 400, "invalid_params", parsedParams.error);
  }

  const { conversationId } = parsedParams.data;
  const userId = req.user.id;

  try {
    const metric = await findMetricByConversationIdAndUser(
      conversationId,
      userId
    );

    return sendSuccess(res, 200, metric);
  } catch (err) {
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
