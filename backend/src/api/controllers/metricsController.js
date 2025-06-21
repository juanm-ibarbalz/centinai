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
 * Controlador para obtener métricas.
 * Si se provee `agentPhoneNumberId`, filtra por agente.
 * Si no, devuelve todas las métricas del usuario.
 * @route GET /metrics?agentPhoneNumberId=xxx
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
    console.error("Error obteniendo métricas por agente:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Controlador para obtener todas las métricas de un usuario autenticado.
 * @route GET /metrics/all
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
    console.error("Error obteniendo métricas por usuario:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Controlador para obtener métricas de una conversación si pertenece al usuario autenticado.
 * @route GET /metrics/:conversationId
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
