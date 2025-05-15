import { sendError } from "../../utils/responseUtils.js";
import { processIncomingRequest } from "../../services/webhook.service.js";

/**
 * Procesa los mensajes entrantes del webhook.
 * Llama al servicio de mensajes y responde con 200 si se procesa correctamente.
 * @route POST /webhook
 * @param {Request} req
 * @param {Response} res
 */
export const handleIncomingMessage = async (req, res) => {
  try {
    await processIncomingRequest(req);
    res.sendStatus(200);
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
    sendError(res, err.status || 500, err.message || "generic_error");
  }
};
