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
 * Controlador para registrar un nuevo agente.
 * Valida el cuerpo de la solicitud y asocia el agente al usuario autenticado.
 * Devuelve el secretToken generado para identificar al agente en las solicitudes entrantes.
 * @route POST /agents
 */
export const createAgentController = async (req, res) => {
  const result = agentValidationSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload", result.error);
  }

  const userId = req.user.id;
  const data = { ...result.data, userId };

  // validación de existencia
  const exists = await Agent.findOne({ phoneNumberId: data.phoneNumberId });
  if (exists) return sendError(res, 400, "agent_already_exists");

  // validación de límite
  const count = await Agent.countDocuments({ userId });
  if (count >= limitsConfig.maxAgentsPerUser) {
    return sendError(res, 400, "max_agents_reached");
  }

  // validación de lógica cruzada
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
    console.error("Error al registrar agente:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Elimina un agente del usuario autenticado y borra en cascada sus conversaciones y mensajes.
 * @route DELETE /agents/:id
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
    console.error("Error eliminando agente:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Devuelve los agentes del usuario autenticado.
 * @route GET /agents
 */
export const getAgentsController = async (req, res) => {
  const userId = req.user.id;

  try {
    const agents = await getAgentsByUser(userId);
    return sendSuccess(res, 200, agents);
  } catch (err) {
    console.error("Error obteniendo agentes:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Actualiza el fieldMapping de un agente.
 * @route PATCH /agents/:id/mapping
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
      message: "Mapping actualizado correctamente",
      fieldMapping: updatedFieldMapping,
    });
  } catch (err) {
    console.error("Error actualizando mapping:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Regenera el secretToken de un agente del usuario autenticado.
 * @route POST /agents/:id/rotate-secret
 */
export const rotateSecretTokenController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const agent = await Agent.findOne({ _id: id, userId });
  if (!agent) return sendError(res, 404, "agent_not_found");

  try {
    const newToken = await rotateSecretToken(id);
    return sendSuccess(res, 200, {
      message: "Secret token regenerado correctamente",
      secretToken: newToken,
    });
  } catch (err) {
    console.error("Error al regenerar token:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Actualiza los datos de un agente.
 * Valida el cuerpo de la solicitud y delega la lógica al servicio.
 * @route PATCH /agents/:id
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
      message: "Agente actualizado correctamente",
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
    console.error("Error actualizando agente:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
