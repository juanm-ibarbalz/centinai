import { sendError } from "../../utils/responseUtils.js";
import { processIncomingRequest } from "../../services/webhook.service.js";
import { webhookAuthSchema } from "../../schemas/webhook.schema.js";

/**
 * Procesa los mensajes entrantes del webhook.
 * Llama al servicio de mensajes y responde con 200 si se procesa correctamente.
 * @route POST /webhook
 * @param {Request} req
 * @param {Response} res
 */
export const handleIncomingMessage = async (req, res) => {
  const parsed = webhookAuthSchema.safeParse({
    secret: req.query.secret,
    xAgentSecret: req.headers["x-agent-secret"],
    agentSecret: req.body.agentSecret,
  });
  if (!parsed.success) {
    return sendError(res, 400, "invalid_webhook_auth", parsed.error.format());
  }

  req.agentSecret = parsed.data.secret;

  try {
    await processIncomingRequest(req);
    res.sendStatus(200);
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
    sendError(res, err.status || 500, err.message || "server_error");
  }
};
