import Metric from "./../models/Metric.js";

/**
 * Devuelve todas las métricas de un agente (sólo del usuario autenticado).
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
    .sort({ endtime: 1 })
    .skip(offset)
    .limit(limit);
};

/**
 * Devuelve las métricas de una conversación si le pertenece al usuario.
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
