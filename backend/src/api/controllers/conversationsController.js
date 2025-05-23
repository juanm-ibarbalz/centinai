import { findConversationsByAgent } from "../../services/processors/conversation.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";

/**
 * Controlador para obtener las conversaciones de un agente del usuario autenticado.
 * Soporta paginación con los parámetros limit y offset.
 * @route GET /conversations?agentPhoneNumberId=xxx&limit=20&offset=0
 * @param {Request} req
 * @param {Response} res
 */
export const getConversationsByAgent = async (req, res) => {
  const { id: userId } = req.user;
  const { agentPhoneNumberId, limit = 20, offset = 0 } = req.query;

  if (!agentPhoneNumberId) {
    return sendError(res, 400, "missing_agent_id");
  }

  try {
    const conversations = await findConversationsByAgent(
      userId,
      agentPhoneNumberId,
      parseInt(limit),
      parseInt(offset),
    );
    return sendSuccess(res, 200, conversations);
  } catch (err) {
    console.error("Error obteniendo conversaciones:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
