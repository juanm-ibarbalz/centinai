import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import { saveIncomingMessage } from "../../services/message.service.js";
import { applyMapping } from "../../services/helpers/webhook.helpers.js";
import { webhookAuthSchema } from "../../validators/webhook.validator.js";
import Agent from "../../models/Agent.js";

/**
 * Processes incoming webhook messages from external services (e.g., WhatsApp).
 * - Validates webhook authentication using multiple methods.
 * - Maps, validates y normalizes the incoming message payload.
 * - Saves the message to the database.
 *
 * @route POST /webhook
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters.
 * @param {string} [req.query.secret] - Secret token for authentication (query param method).
 * @param {Object} req.headers - Request headers.
 * @param {string} [req.headers.x-agent-secret] - Secret token for authentication (header method).
 * @param {Object} req.body - Request body containing webhook data.
 * @param {string} [req.body.agentSecret] - Secret token for authentication (body method).
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with success confirmation or error.
 * @throws {400} When webhook authentication, mapping, or validation fails.
 * @throws {404} When agent with provided secret token is not found.
 * @throws {500} When server error occurs during message processing.
 */
export const handleIncomingMessage = async (req, res) => {
  const auth = webhookAuthSchema.safeParse({
    secret: req.query.secret,
    xAgentSecret: req.headers["x-agent-secret"],
    agentSecret: req.body.agentSecret,
  });
  if (!auth.success) {
    return sendError(res, 400, "invalid_webhook_auth", auth.error);
  }

  const agent = await Agent.findOne({ secretToken: auth.data.secret });
  if (!agent) return sendError(res, 404, "agent_not_found");

  let mapped;
  try {
    mapped = applyMapping(
      req.body,
      agent.fieldMapping || {},
      agent.payloadFormat,
      agent.phoneNumberId
    );
  } catch (err) {
    return sendError(res, 400, err.message || "invalid_mapping");
  }

  try {
    await saveIncomingMessage({ ...mapped, userId: agent.userId });
    return sendSuccess(res, 200, { message: "[WEBHOOK OK]" });
  } catch (err) {
    sendError(res, err.status || 500, err.message || "server_error");
  }
};
