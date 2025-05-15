import crypto from "crypto";
import Agent from "../models/Agent.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { limitsConfig } from "../config/config.js";
import { generateAgentId } from "../utils/idGenerator.js";

/**
 * Crea un nuevo agente para un usuario dado si el número de teléfono no está ya registrado
 * y el usuario no superó el límite de agentes permitidos.
 *
 * @param {Object} data - Datos necesarios para crear el agente
 * @param {string} data.userId - ID del usuario dueño del agente
 * @param {string} data.phoneNumberId - ID del número de teléfono
 * @param {string} data.name - Nombre del agente
 * @param {string} [data.description] - Descripción opcional del agente
 * @param {string} data.integrationMode - Modo de integración ("structured", "custom-mapped", "query-only")
 * @param {Object} [data.fieldMapping] - Mapeo personalizado de campos (si aplica)
 * @returns {Promise<Agent>} - Agente recién creado
 * @throws {Error} - Si ya existe un agente con el mismo número o se supera el límite
 */
export const createAgentService = async ({
  userId,
  phoneNumberId,
  name,
  description,
  integrationMode,
  fieldMapping,
}) => {
  const existing = await Agent.findOne({ phoneNumberId });
  if (existing) throw new Error("Este agente ya está registrado");

  const count = await Agent.countDocuments({ userId });
  if (count >= limitsConfig.maxAgentsPerUser)
    throw new Error("Límite de 3 agentes por usuario alcanzado");

  const agentId = generateAgentId(userId);

  const agent = new Agent({
    _id: agentId,
    userId,
    phoneNumberId,
    name,
    description,
    integrationMode,
    fieldMapping: fieldMapping || {},
    createdAt: new Date(),
  });

  await agent.save();
  return agent;
};

/**
 * Elimina un agente por ID y todos sus datos relacionados, validando propiedad.
 * @param {string} userId - ID del usuario autenticado
 * @param {string} agentId - ID del agente a eliminar
 * @returns {Promise<void>}
 * @throws {Error} - Si el agente no existe o no pertenece al usuario
 */
export const deleteAgentWithCascade = async (userId, agentId) => {
  const agent = await Agent.findOne({ _id: agentId, userId });
  if (!agent) {
    const err = new Error("Agente no encontrado");
    err.status = 404;
    throw err;
  }

  const phoneNumberId = agent.phoneNumberId;

  const conversations = await Conversation.find({
    agentPhoneNumberId: phoneNumberId,
  });
  const conversationIds = conversations.map((c) => c._id);

  await Message.deleteMany({ conversationId: { $in: conversationIds } });
  await Conversation.deleteMany({ agentPhoneNumberId: phoneNumberId });
  await agent.deleteOne();
};

/**
 * Devuelve todos los agentes pertenecientes a un usuario.
 * @param {string} userId
 * @returns {Promise<Agent[]>}
 */
export const getAgentsByUser = async (userId) => {
  return Agent.find({ userId })
    .select("name phoneNumberId integrationMode secretToken")
    .sort({ createdAt: -1 });
};

/**
 * Actualiza el fieldMapping de un agente si el modo lo permite.
 *
 * @param {string} userId - ID del usuario autenticado
 * @param {string} agentId - ID del agente a modificar
 * @param {Object} newMapping - Nuevo objeto de mapeo
 * @returns {Promise<Agent>} - Agente actualizado
 * @throws {Error} - Si el agente no existe o tiene modo structured
 */
export const updateAgentMapping = async (userId, agentId, newMapping) => {
  const agent = await Agent.findOne({ _id: agentId, userId });
  if (!agent) {
    const err = new Error("Agente no encontrado");
    err.status = 404;
    throw err;
  }

  if (agent.integrationMode === "structured") {
    const err = new Error("mapping_not_allowed_with_structured_mode");
    err.status = 400;
    throw err;
  }

  agent.fieldMapping = newMapping;
  await agent.save();
  return agent;
};

/**
 * Regenera el secretToken de un agente y lo devuelve.
 *
 * @param {string} userId - ID del usuario autenticado
 * @param {string} agentId - ID del agente a actualizar
 * @returns {Promise<string>} - Nuevo token generado
 * @throws {Error} - Si el agente no existe o no pertenece al usuario
 */
export const rotateSecretToken = async (userId, agentId) => {
  const agent = await Agent.findOne({ _id: agentId, userId });
  if (!agent) {
    const err = new Error("Agente no encontrado");
    err.status = 404;
    throw err;
  }

  agent.secretToken = crypto.randomUUID();
  await agent.save();
  return agent.secretToken;
};
