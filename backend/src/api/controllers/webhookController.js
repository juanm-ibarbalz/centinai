import { saveIncomingMessage } from "../../services/processors/message.service.js";
import { sendError } from "../../utils/responseUtils.js";

/**
 * Verifica el webhook de WhatsApp para la suscripción inicial.
 * Valida el token y devuelve el challenge proporcionado por Meta.
 * @route GET /webhook
 * @param {Request} req
 * @param {Response} res
 */
export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Verifying webhook:", req.query);

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    return sendError(res, 403, "unauthorized_access");
  }
};

/**
 * Procesa los mensajes entrantes desde el webhook de WhatsApp.
 * Llama al servicio de mensajes y responde con 200 si se procesa correctamente.
 * @route POST /webhook
 * @param {Request} req
 * @param {Response} res
 */
export const handleIncomingMessage = async (req, res) => {
  try {
    console.log("Analizando mensaje...");
    await saveIncomingMessage(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling message:", err);
    return sendError(res, 500, "generic_error");
  }
};
