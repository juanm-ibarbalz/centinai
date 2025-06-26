import {
  createAgentService,
  deleteAgentWithCascade,
  getAgentsByUser,
  updateAgentMapping,
  rotateSecretToken,
  updateAgentService,
} from "../../services/agent.service.js";
import {
  agentValidationSchema,
  validateAgentLogic,
  updateAgentSchema,
} from "../../validators/agent.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import { limitsConfig } from "../../config/config.js";
import Agent from "../../models/Agent.js";

/**
 * Controller for creating a new agent.
 * Validates the request body using Zod schema, checks for duplicate phone numbers,
 * validates user agent limits, and creates the agent in the database.
 * Returns the generated secretToken for agent identification in incoming requests.
 *
 * @route POST /agents
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing agent creation data
 * @param {string} req.body.name - Agent's display name
 * @param {string} req.body.phoneNumberId - WhatsApp phone number identifier
 * @param {string} req.body.payloadFormat - Format for incoming webhook payloads
 * @param {string} req.body.authMode - Authentication mode for webhook requests
 * @param {Object} req.body.fieldMapping - Field mapping configuration
 * @param {string} req.body.modelName - AI model name for the agent
 * @param {string} [req.body.description] - Optional agent description
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created agent data including secretToken
 * @throws {400} When validation fails, agent already exists, or limit exceeded
 * @throws {500} When server error occurs during agent creation
 */
export const createAgentController = async (req, res) => {
  const result = agentValidationSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload", result.error);
  }

  const userId = req.user.id;
  const data = { ...result.data, userId };

  const exists = await Agent.findOne({ phoneNumberId: data.phoneNumberId });
  if (exists) return sendError(res, 400, "agent_already_exists");

  const count = await Agent.countDocuments({ userId });
  if (count >= limitsConfig.maxAgentsPerUser) {
    return sendError(res, 400, "max_agents_reached");
  }

  const logicError = validateAgentLogic({
    payloadFormat: data.payloadFormat,
    fieldMapping: data.fieldMapping,
  });
  if (logicError) return sendError(res, 400, "invalid_payload", logicError);

  try {
    const agent = await createAgentService(data);

    return sendSuccess(res, 201, {
      id: agent._id,
      name: agent.name,
      phoneNumberId: agent.phoneNumberId,
      payloadFormat: agent.payloadFormat,
      authMode: agent.authMode,
      secretToken: agent.secretToken,
      modelName: agent.modelName,
    });
  } catch (err) {
    console.error("Error registering agent:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Deletes an agent belonging to the authenticated user and cascades deletion
 * to all associated conversations and messages.
 *
 * @route DELETE /agents/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Agent's unique identifier
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 * @throws {404} When agent is not found or doesn't belong to user
 * @throws {500} When server error occurs during deletion
 */
export const deleteAgentController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const agent = await Agent.findOne({ _id: id, userId });
  if (!agent) return sendError(res, 404, "agent_not_found");

  try {
    await deleteAgentWithCascade(agent.phoneNumberId);
    return sendSuccess(res, 204);
  } catch (err) {
    console.error("Error deleting agent:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Retrieves all agents belonging to the authenticated user.
 *
 * @route GET /agents
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of user's agents
 * @throws {500} When server error occurs during retrieval
 */
export const getAgentsController = async (req, res) => {
  const userId = req.user.id;

  try {
    const agents = await getAgentsByUser(userId);
    return sendSuccess(res, 200, agents);
  } catch (err) {
    console.error("Error getting agents:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Updates the field mapping configuration for a specific agent.
 * Validates the new field mapping against the agent's payload format.
 *
 * @route PATCH /agents/:id/mapping
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Agent's unique identifier
 * @param {Object} req.body - Request body containing new field mapping
 * @param {Object} req.body.fieldMapping - New field mapping configuration
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated field mapping
 * @throws {400} When field mapping validation fails
 * @throws {404} When agent is not found or doesn't belong to user
 * @throws {500} When server error occurs during update
 */
export const updateAgentMappingController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const agent = await Agent.findOne({ _id: id, userId });
  if (!agent) return sendError(res, 404, "agent_not_found");

  const fieldMapping = req.body.fieldMapping;

  const logicError = validateAgentLogic({
    payloadFormat: agent.payloadFormat,
    fieldMapping: fieldMapping,
  });
  if (logicError) return sendError(res, 400, "invalid_payload", logicError);

  try {
    const updatedFieldMapping = await updateAgentMapping(id, fieldMapping);

    return sendSuccess(res, 200, {
      message: "Mapping updated successfully",
      fieldMapping: updatedFieldMapping,
    });
  } catch (err) {
    console.error("Error updating mapping:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Regenerates the secret token for a specific agent.
 * This invalidates the previous token and generates a new one for security.
 *
 * @route POST /agents/:id/rotate-secret
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Agent's unique identifier
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new secret token
 * @throws {404} When agent is not found or doesn't belong to user
 * @throws {500} When server error occurs during token regeneration
 */
export const rotateSecretTokenController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const agent = await Agent.findOne({ _id: id, userId });
  if (!agent) return sendError(res, 404, "agent_not_found");

  try {
    const newToken = await rotateSecretToken(id);
    return sendSuccess(res, 200, {
      message: "Secret token regenerated successfully",
      secretToken: newToken,
    });
  } catch (err) {
    console.error("Error regenerating token:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Updates agent information for a specific agent.
 * Validates the request body using Zod schema and updates the agent in the database.
 *
 * @route PATCH /agents/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Agent's unique identifier
 * @param {Object} req.body - Request body containing agent update data
 * @param {string} [req.body.name] - New agent name (optional)
 * @param {string} [req.body.description] - New agent description (optional)
 * @param {string} [req.body.modelName] - New AI model name (optional)
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated agent data
 * @throws {400} When request body validation fails
 * @throws {404} When agent is not found or doesn't belong to user
 * @throws {500} When server error occurs during update
 */
export const updateAgentController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const update = req.body;

  const result = updateAgentSchema.safeParse(update);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload", result.error);
  }

  const agent = await Agent.findOne({ _id: id, userId });
  if (!agent) {
    return sendError(res, 404, "agent_not_found");
  }

  try {
    const updatedAgent = await updateAgentService(id, update);

    return sendSuccess(res, 200, {
      message: "Agent updated successfully",
      agent: {
        id: updatedAgent._id,
        name: updatedAgent.name,
        phoneNumberId: updatedAgent.phoneNumberId,
        payloadFormat: updatedAgent.payloadFormat,
        authMode: updatedAgent.authMode,
        description: updatedAgent.description,
        fieldMapping: updatedAgent.fieldMapping,
        modelName: updatedAgent.modelName,
      },
    });
  } catch (err) {
    console.error("Error updating agent:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
