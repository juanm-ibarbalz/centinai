import Metric from "./../models/Metric.js";

/**
 * Retrieves metrics for a specific agent belonging to the authenticated user.
 * Returns paginated results sorted by conversation end time (most recent first).
 *
 * @param {string} userId - ID of the user whose metrics to retrieve
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {number} limit - Maximum number of metrics to return
 * @param {number} offset - Number of metrics to skip for pagination
 * @returns {Promise<Array>} Array of metric objects for the specified agent
 */
export const findMetricsByAgent = async (
  userId,
  agentPhoneNumberId,
  limit,
  offset
) => {
  return await Metric.find({
    userId,
    "agentData.agentId": agentPhoneNumberId,
  })
    .sort({ endTime: -1 })
    .skip(offset)
    .limit(limit);
};

/**
 * Retrieves all metrics for the authenticated user across all agents.
 * Returns paginated results sorted by conversation end time (most recent first).
 *
 * @param {string} userId - ID of the user whose metrics to retrieve
 * @param {number} limit - Maximum number of metrics to return
 * @param {number} offset - Number of metrics to skip for pagination
 * @returns {Promise<Array>} Array of metric objects for all user's agents
 */
export const findMetricsByUser = async (userId, limit, offset) => {
  return await Metric.find({ userId })
    .sort({ endTime: -1 })
    .skip(offset)
    .limit(limit);
};

/**
 * Retrieves metrics for a specific conversation if it belongs to the user.
 * Validates conversation ownership before returning the metrics data.
 *
 * @param {string} conversationId - ID of the conversation to get metrics for
 * @param {string} userId - ID of the user requesting the metrics (for ownership validation)
 * @returns {Promise<Object>} Metric object for the specified conversation
 * @throws {Error} When metric is not found or doesn't belong to the user (status: 404)
 */
export const findMetricByConversationIdAndUser = async (
  conversationId,
  userId
) => {
  const metric = await Metric.findOne({ conversationId, userId });
  if (!metric) {
    const err = new Error("metric_not_found");
    err.status = 404;
    throw err;
  }

  return metric;
};
