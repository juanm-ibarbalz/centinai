import {
  createAgentService,
  deleteAgentWithCascade,
  getAgentsByUser,
  updateAgentMapping,
  rotateSecretToken,
} from "../../services/agent.service.js";
import {
  agentValidationSchema,
  validateAgentLogic,
  validateUpdateMappingRequest,
} from "../../validators/agent.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
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
    return sendError(res, 400, "invalid_payload");
  }

  const logicError = validateAgentLogic(result.data);
  if (logicError) {
    return sendError(res, 400, logicError);
  }

  const userId = req.user.id;
  const data = { ...result.data, userId };

  try {
    const agent = await createAgentService(data);
    return sendSuccess(res, 201, {
      id: agent._id,
      name: agent.name,
      phoneNumberId: agent.phoneNumberId,
      payloadFormat: agent.payloadFormat,
      authMode: agent.authMode,
      secretToken: agent.secretToken,
    });
  } catch (err) {
    console.error("Error al registrar agente:", err);
    const known =
      err.message === "Este agente ya está registrado"
        ? "max_agents_reached"
        : err.message;
    return sendError(res, 400, known);
  }
};

/**
 * Elimina un agente del usuario autenticado y borra en cascada sus conversaciones y mensajes.
 * @route DELETE /agents/:id
 */
export const deleteAgentController = async (req, res) => {
  try {
    await deleteAgentWithCascade(req.user.id, req.params.id);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error eliminando agente:", err);
    return sendError(res, err.status || 500, err.message || "generic_error");
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
    return sendError(res, 500, "generic_error");
  }
};

/**
 * Actualiza el fieldMapping de un agente.
 * @route PATCH /agents/:id/mapping
 */
export const updateAgentMappingController = async (req, res) => {
  try {
    const { fieldMapping } = await validateUpdateMappingRequest(req);

    const updated = await updateAgentMapping(
      req.user.id,
      req.params.id,
      fieldMapping,
    );

    return sendSuccess(res, 200, {
      message: "Mapping actualizado correctamente",
      fieldMapping: updated.fieldMapping,
    });
  } catch (err) {
    if (err.zod) {
      console.error("Errores de Zod:", err.zod);
    } else {
      console.error("Error validando mapping:", err);
    }
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Regenera el secretToken de un agente del usuario autenticado.
 * @route POST /agents/:id/rotate-secret
 */
export const rotateSecretTokenController = async (req, res) => {
  try {
    const newToken = await rotateSecretToken(req.user.id, req.params.id);
    return sendSuccess(res, 200, {
      message: "Secret token regenerado correctamente",
      secretToken: newToken,
    });
  } catch (err) {
    console.error("Error al regenerar token:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
