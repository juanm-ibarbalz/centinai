import { applyMapping } from "../services/helpers/webhook.helpers.js";
import { saveIncomingMessage } from "./message.service.js";

/**
 * Procesa una solicitud entrante desde el webhook y delega el procesamiento del mensaje
 * @param {import("express").Request} req
 * @throws {Error} Si hay un error de mapeo o formato de payload
 */
export const processIncomingRequest = async (req, agent) => {
  const parsed = applyMapping(
    req.body,
    agent.fieldMapping || {},
    agent.payloadFormat,
    agent.phoneNumberId
  );
  if (!parsed) {
    const error = new Error("invalid_mapping_or_payload");
    error.status = 400;
    throw error;
  }

  parsed.userId = agent.userId;
  await saveIncomingMessage(parsed);
};
