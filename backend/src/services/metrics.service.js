import Metric from "./../models/Metric.js";

/**
 * Devuelve todas las métricas de un agente (sólo del usuario autenticado).
 */
export const findMetricsByAgent = async (
  userId,
  agentPhoneNumberId,
  limit,
  offset,
) => {
  return await Metric.find({
    userId,
    "agentData.agentId": agentPhoneNumberId,
  })
    .sort({ startTime: -1 }) // orden opcional: más recientes primero
    .skip(offset)
    .limit(limit);
};

/**
 * Devuelve las métricas de una conversación si le pertenece al usuario.
 */
export const findMetricByConversationIdAndUser = async (
  conversationId,
  userId,
) => {
  return await Metric.findOne({ conversationId, userId });
};
