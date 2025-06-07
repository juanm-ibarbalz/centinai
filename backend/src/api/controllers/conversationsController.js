import { findConversationsByAgent } from "../../services/conversation.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import { getConversationsQuerySchema } from "../validators/conversations.validator.js";

/**
 * Controlador para obtener las conversaciones de un agente del usuario autenticado.
 * Soporta:
 *   • Paginación: limit, offset
 *   • Ordenamiento: sortBy = duration | cost | date ; sortOrder = asc | desc
 *   • Filtrado por rango de fecha: dateFrom, dateTo (ISO strings)
 *
 * @route GET /conversations?agentPhoneNumberId=xxx
 *                       &limit=20&offset=0
 *                       &sortBy=duration|cost|date
 *                       &sortOrder=asc|desc
 *                       &dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 * @param {Request} req
 * @param {Response} res
 */
export const getConversationsByAgent = async (req, res) => {
  const parsed = getConversationsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_query", parsed.error.format());
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

  try {
    const conversations = await findConversationsByAgent(
      req.user.id,
      agentPhoneNumberId,
      { limit, offset, sortBy, sortOrder, dateFrom, dateTo },
    );
    return sendSuccess(res, 200, conversations);
  } catch (err) {
    console.error("Error obteniendo conversaciones:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
