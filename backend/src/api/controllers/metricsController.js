import {
  findMetricsByAgent,
  findMetricByConversationIdAndUser,
} from "../../services//metrics.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import {
  listMetricsQuerySchema,
  getMetricParamsSchema,
} from "../../schemas/metricsSchemas.js";

/**
 * Controlador para obtener métricas de todas las conversaciones de un agente
 * pertenecientes al usuario autenticado.
 * @route GET /metrics?agentPhoneNumberId=xxx
 */
export const getMetricsByAgent = async (req, res) => {
  const parsed = listMetricsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_query", parsed.error.format());
  }

  const { agentPhoneNumberId, limit, offset } = parsed.data;
  const userId = req.user.id;

  try {
    const metrics = await findMetricsByAgent(
      userId,
      agentPhoneNumberId,
      limit,
      offset,
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
  const parsedParams = getMetricParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return sendError(res, 400, "invalid_params", parsedParams.error.format());
  }

  const { conversationId } = parsedParams.data;
  const userId = req.user.id;

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
