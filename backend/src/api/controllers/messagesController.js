import { getMessagesByConversationId } from "../../services/processors/message.service.js";
import { sendError } from "../../utils/responseUtils.js";

/**
 * Lista los mensajes de una conversación específica, con paginación.
 * Verifica que la conversación pertenezca al usuario autenticado.
 * @route GET /messages
 * @param {Request} req - Requiere query param `conversationId` y opcional `limit`, `offset`
 * @param {Response} res
 */
export const listMessages = async (req, res) => {
  const { conversationId, limit = 20, offset = 0 } = req.query;
  const userId = req.user.id;

  if (!conversationId) {
    return sendError(res, 400, "conversation_id_required");
  }

  try {
    const messages = await getMessagesByConversationId(
      conversationId,
      userId,
      parseInt(limit),
      parseInt(offset),
    );
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return sendError(res, err.status || 500, err.message || "generic_error");
  }
};
