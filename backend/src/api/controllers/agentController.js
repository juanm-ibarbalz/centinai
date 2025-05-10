import {
  createAgent,
  deleteAgentWithCascade,
  getAgentsByUser,
} from "../../services/agent.service.js";
import { createAgentSchema } from "../../validators/agent.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";

/**
 * Controlador para registrar un nuevo agente.
 * Valida el cuerpo de la solicitud y asocia el agente al usuario autenticado.
 * @route POST /agents
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 * @returns {void}
 */
export const createAgentController = async (req, res) => {
  const result = createAgentSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload");
  }

  const userId = req.user.id;

  try {
    const agent = await createAgent({ userId, ...result.data });
    return sendSuccess(res, 201, agent);
  } catch (error) {
    console.error("Error al registrar agente:", error);
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
 * @param {Request} req
 * @param {Response} res
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
