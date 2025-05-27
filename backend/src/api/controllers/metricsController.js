import {
  findMetricsByAgent,
  findMetricByConversationIdAndUser,
} from "../../services//metrics.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";

/**
 * Controlador para obtener métricas de todas las conversaciones de un agente
 * pertenecientes al usuario autenticado.
 * @route GET /metrics?agentPhoneNumberId=xxx
 */
export const getMetricsByAgent = async (req, res) => {
  const { id: userId } = req.user;
  const { agentPhoneNumberId, limit = 20, offset = 0 } = req.query;

  if (!agentPhoneNumberId) {
    return sendError(res, 400, "missing_agent_id");
  }

  try {
    const metrics = await findMetricsByAgent(
      userId,
      agentPhoneNumberId,
      parseInt(limit),
      parseInt(offset),
    );
    return sendSuccess(res, 200, metrics);
  } catch (err) {
    console.error("Error obteniendo métricas por agente:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Controlador para obtener métricas de una conversación si pertenece al usuario autenticado.
 * @route GET /metrics/:conversationId
 */
export const getMetricByConversation = async (req, res) => {
  const { id: userId } = req.user;
  const { conversationId } = req.params;

  try {
    const metric = await findMetricByConversationIdAndUser(
      conversationId,
      userId,
    );
    if (!metric) {
      return sendError(res, 404, "metric_not_found_or_forbidden");
    }

    return sendSuccess(res, 200, metric);
  } catch (err) {
    console.error("Error obteniendo métricas de conversación:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
