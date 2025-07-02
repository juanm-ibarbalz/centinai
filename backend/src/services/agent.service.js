import crypto from "crypto";
import Agent from "../models/Agent.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Metric from "../models/Metric.js";
import { generateAgentId } from "../utils/idGenerator.js";
import { conversationConfig } from "../config/config.js";

/**
 * Creates a new AI agent for a given user if the phone number is not already registered
 * and the user hasn't exceeded the allowed agent limit.
 * Generates a unique secret token for webhook authentication.
 *
 * @param {Object} data - Data required to create the agent
 * @param {string} data.userId - ID of the user who owns the agent
 * @param {string} data.phoneNumberId - WhatsApp phone number identifier
 * @param {string} data.name - Display name for the agent
 * @param {string} [data.description] - Optional description of the agent's purpose
 * @param {'structured'|'custom'} data.payloadFormat - Format for incoming webhook payloads
 * @param {'query'|'header'|'body'} data.authMode - Authentication method for webhook requests
 * @param {Object} [data.fieldMapping] - Field mapping configuration (required if payloadFormat is "custom")
 * @param {string} [data.modelName] - AI model name to be used by the agent
 * @returns {Promise<Object>} Newly created agent object
 * @throws {Error} When agent already exists or user exceeds agent limit
 */
export const createAgentService = async ({
  userId,
  phoneNumberId,
  name,
  description,
  payloadFormat,
  authMode,
  fieldMapping,
  modelName,
}) => {
  const agentId = generateAgentId(userId);

  const agent = new Agent({
    _id: agentId,
    userId,
    phoneNumberId,
    name,
    description,
    payloadFormat,
    authMode,
    fieldMapping: fieldMapping || {},
    secretToken: crypto.randomUUID(),
    modelName,
    createdAt: new Date(),
  });

  await agent.save();
  return agent;
};

/**
 * Deletes an agent by phone number ID and all related data (cascade deletion).
 * Removes all conversations, messages and metrics associated with the agent.
 *
 * @param {string} phoneNumberId - WhatsApp phone number identifier of the agent to delete
 * @returns {Promise<void>} Resolves when agent and all related data are deleted
 * @throws {Error} When agent doesn't exist or doesn't belong to the user
 */
export const deleteAgentWithCascade = async (phoneNumberId) => {
  const conversations = await Conversation.find({
    agentPhoneNumberId: phoneNumberId,
  });
  const conversationIds = conversations.map((c) => c._id);

  const agent = await Agent.findOne({ phoneNumberId });
  if (!agent) {
    return;
  }

  await Metric.deleteMany({ "agentData.agentId": agent._id });
  await Message.deleteMany({ conversationId: { $in: conversationIds } });
  await Conversation.deleteMany({ agentPhoneNumberId: phoneNumberId });
  await Agent.deleteOne({ phoneNumberId });
};

/**
 * Retrieves all agents belonging to a specific user.
 * Returns a simplified view with essential agent information.
 *
 * @param {string} userId - ID of the user whose agents to retrieve
 * @returns {Promise<Array>} Array of agent objects with selected fields
 */
export const getAgentsByUser = async (userId) => {
  return Agent.find({ userId })
    .select("name phoneNumberId payloadFormat authMode description modelName")
    .sort({ createdAt: 1 });
};

/**
 * Updates the field mapping configuration for a specific agent.
 * Field mapping is used to map incoming webhook fields to system fields.
 *
 * @param {string} agentId - ID of the agent to modify
 * @param {Object} fieldMapping - New field mapping configuration object
 * @returns {Promise<Object>} Updated field mapping configuration
 * @throws {Error} When agent is not found (status: 404)
 */
export const updateAgentMapping = async (agentId, fieldMapping) => {
  const agent = await Agent.findByIdAndUpdate(
    agentId,
    { fieldMapping },
    { new: true }
  );
  if (!agent) {
    const err = new Error("agent_not_found");
    err.status = 404;
    throw err;
  }

  return agent.fieldMapping;
};

/**
 * Regenerates the secret token for a specific agent.
 * This invalidates the previous token and generates a new one for security purposes.
 *
 * @param {string} agentId - ID of the agent to update
 * @returns {Promise<string>} Newly generated secret token
 * @throws {Error} When agent doesn't exist or doesn't belong to the user (status: 404)
 */
export const rotateSecretToken = async (agentId) => {
  const agent = await Agent.findByIdAndUpdate(
    agentId,
    { secretToken: crypto.randomUUID() },
    { new: true }
  );
  if (!agent) {
    const err = new Error("agent_not_found");
    err.status = 404;
    throw err;
  }

  return agent.secretToken;
};

/**
 * Updates general agent information while maintaining data integrity.
 * Only allows updating specific fields and handles field mapping cleanup
 * when switching to structured payload format.
 *
 * @param {string} agentId - ID of the agent to update
 * @param {Object} data - Update data containing allowed fields
 * @param {string} [data.name] - New agent name
 * @param {string} [data.description] - New agent description
 * @param {string} [data.modelName] - New AI model name
 * @param {'structured'|'custom'} [data.payloadFormat] - New payload format
 * @param {'query'|'header'|'body'} [data.authMode] - New authentication mode
 * @returns {Promise<Object>} Updated agent object
 * @throws {Error} When agent is not found or update logic is invalid (status: 404)
 */
export const updateAgentService = async (agentId, data) => {
  const allowedFields = [
    "name",
    "description",
    "modelName",
    "payloadFormat",
    "authMode",
  ];

  const safeUpdate = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      safeUpdate[key] = data[key];
    }
  }

  if (data.payloadFormat === conversationConfig.structuredMapping) {
    safeUpdate.fieldMapping = {};
  }

  const agent = await Agent.findByIdAndUpdate(agentId, safeUpdate, {
    new: true,
  });
  if (!agent) {
    const err = new Error("agent_not_found");
    err.status = 404;
    throw err;
  }

  return agent;
};
