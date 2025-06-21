import { applyMapping } from "../services/helpers/webhook.helpers.js";
import { saveIncomingMessage } from "./message.service.js";

/**
 * Processes an incoming webhook request and delegates message processing.
 * Applies field mapping based on agent configuration and saves the processed message.
 *
 * @param {import("express").Request} req - Express request object containing webhook data
 * @param {Object} req.body - Request body with incoming webhook payload
 * @param {Object} agent - Agent object with configuration for processing
 * @param {Object} agent.fieldMapping - Field mapping configuration for custom payloads
 * @param {'structured'|'custom'} agent.payloadFormat - Format of incoming webhook payloads
 * @param {string} agent.phoneNumberId - WhatsApp phone number identifier of the agent
 * @param {string} agent.userId - ID of the user who owns the agent
 * @returns {Promise<void>} Resolves when webhook is successfully processed
 * @throws {Error} When mapping fails or payload format is invalid (status: 400)
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
