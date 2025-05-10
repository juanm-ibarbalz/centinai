import { findConversationsByAgent } from "../../services/processors/conversation.service.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";

/**
 * Controlador para obtener las conversaciones de un agente del usuario autenticado.
 * @route GET /conversations?agentPhoneNumberId=xxx
 * @param {Request} req
 * @param {Response} res
 */
export const getConversationsByAgent = async (req, res) => {
  const { id: userId } = req.user;
  const { agentPhoneNumberId } = req.query;

  if (!agentPhoneNumberId) {
    return sendError(res, 400, "missing_agent_id");
  }

  try {
    const conversations = await findConversationsByAgent(
      userId,
      agentPhoneNumberId,
    );
    return sendSuccess(res, 200, conversations);
  } catch (err) {
    console.error("Error obteniendo conversaciones:", err);
    return sendError(res, 500, "generic_error");
  }
};
