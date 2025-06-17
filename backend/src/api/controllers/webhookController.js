import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import { processIncomingRequest } from "../../services/webhook.service.js";
import { webhookAuthSchema } from "../../validators/webhook.validator.js";
import Agent from "../../models/Agent.js";

/**
 * Procesa los mensajes entrantes del webhook.
 * Llama al servicio de mensajes y responde con 200 si se procesa correctamente.
 * @route POST /webhook
 * @param {Request} req
 * @param {Response} res
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

  try {
    await processIncomingRequest(req, agent);
    return sendSuccess(res, 200, { message: "[WEBHOOK OK]" });
  } catch (err) {
    sendError(res, err.status || 500, err.message || "server_error");
  }
};
