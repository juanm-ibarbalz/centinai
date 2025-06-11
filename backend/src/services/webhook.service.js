import { applyMapping } from "../services/helpers/webhook.helpers.js";
import { saveIncomingMessage } from "./message.service.js";

/**
 * Procesa una solicitud entrante desde el webhook y delega el procesamiento del mensaje
 * @param {import("express").Request} req
 */
export const processIncomingRequest = async (req) => {
  const parsed = applyMapping(
    req.body,
    agent.fieldMapping || {},
    agent.payloadFormat,
    agent.phoneNumberId,
  );

  if (!parsed) {
    const error = new Error("invalid_mapping_or_payload");
    error.status = 400;
    throw error;
  }

  parsed.agentPhoneNumberId = agent.phoneNumberId;
  await saveIncomingMessage(parsed, agent);
};
