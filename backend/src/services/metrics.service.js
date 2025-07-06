import Metric from "./../models/Metric.js";

/**
 * Builds the date filter for metrics queries.
 * Creates a date range filter based on dateFrom and dateTo parameters.
 *
 * @param {Date} [dateFrom] - Minimum date (inclusive) for filtering
 * @param {Date} [dateTo] - Maximum date (inclusive) for filtering
 * @returns {Object} Date filter object for MongoDB query
 */
function buildDateFilter(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return {};

  let dateToAdjusted = dateTo;
  if (typeof dateTo === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    dateToAdjusted = new Date(dateTo + "T23:59:59.999Z");
  }

  if (dateFrom && dateToAdjusted) {
    return { endTime: { $gte: dateFrom, $lte: dateToAdjusted } };
  } else if (dateFrom) {
    return { endTime: { $gte: dateFrom } };
  } else if (dateToAdjusted) {
    return { endTime: { $lte: dateToAdjusted } };
  }

  return {};
}

/**
 * Retrieves metrics for a specific agent belonging to the authenticated user.
 * Returns results sorted by conversation end time (most recent first) with optional date filtering.
 *
 * @param {string} userId - ID of the user whose metrics to retrieve
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {Date} [dateFrom] - Start date for filtering (inclusive)
 * @param {Date} [dateTo] - End date for filtering (inclusive)
 * @returns {Promise<Array>} Array of metric objects for the specified agent
 */
export const findMetricsByAgent = async (
  userId,
  agentPhoneNumberId,
  dateFrom,
  dateTo
) => {
  const dateFilter = buildDateFilter(dateFrom, dateTo);

  return await Metric.find({
    userId,
    "agentData.agentId": agentPhoneNumberId,
    ...dateFilter,
  }).sort({ endTime: -1 });
};

/**
 * Retrieves all metrics for the authenticated user across all agents.
 * Returns results sorted by conversation end time (most recent first) with optional date filtering.
 *
 * @param {string} userId - ID of the user whose metrics to retrieve
 * @param {Date} [dateFrom] - Start date for filtering (inclusive)
 * @param {Date} [dateTo] - End date for filtering (inclusive)
 * @returns {Promise<Array>} Array of metric objects for all user's agents
 */
export const findMetricsByUser = async (userId, dateFrom, dateTo) => {
  const dateFilter = buildDateFilter(dateFrom, dateTo);

  return await Metric.find({
    userId,
    ...dateFilter,
  }).sort({ endTime: -1 });
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
