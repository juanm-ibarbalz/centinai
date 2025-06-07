import { getMessagesByConversationId } from "../../services/message.service.js";
import { sendError } from "../../utils/responseUtils.js";
import { listMessagesQuerySchema } from "../validators/messages.validator.js";

/**
 * Lista los mensajes de una conversación específica, con paginación.
 * Verifica que la conversación pertenezca al usuario autenticado.
 * @route GET /messages
 * @param {Request} req - Requiere query param `conversationId` y opcional `limit`, `offset`
 * @param {Response} res
 */
export const listMessages = async (req, res) => {
  const parsed = listMessagesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "invalid_query", parsed.error.format());
  }

  const { conversationId, limit, offset } = parsed.data;
  const userId = req.user.id;

  try {
    const messages = await getMessagesByConversationId(
      conversationId,
      userId,
      limit,
      offset,
    );
    return sendSuccess(res, 200, { messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
