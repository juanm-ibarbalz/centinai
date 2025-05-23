import crypto from "crypto";
import Agent from "../models/Agent.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { limitsConfig } from "../config/config.js";
import { generateAgentId } from "../utils/idGenerator.js";
import { validateAgentLogic } from "../validators/agent.validator.js";
/**
 * Crea un nuevo agente para un usuario dado si el número de teléfono no está ya registrado
 * y el usuario no superó el límite de agentes permitidos.
 *
 * @param {Object} data - Datos necesarios para crear el agente
 * @param {string} data.userId - ID del usuario dueño del agente
 * @param {string} data.phoneNumberId - ID del número de teléfono asociado
 * @param {string} data.name - Nombre del agente
 * @param {string} [data.description] - Descripción opcional
 * @param {string} data.payloadFormat - Formato del payload ("structured" | "custom")
 * @param {string} data.authMode - Método de autenticación ("query" | "header" | "body")
 * @param {Object} [data.fieldMapping] - Mapping requerido si `payloadFormat` es "custom"
 * @returns {Promise<Agent>} - Agente recién creado
 * @throws {Error} - Si ya existe un agente o se supera el límite
 */

export const createAgentService = async ({
  userId,
  phoneNumberId,
  name,
  description,
  payloadFormat,
  authMode,
  fieldMapping,
}) => {
  const logicError = validateAgentLogic(result.data);
  if (logicError) {
    const err = new Error(logicError);
    err.status = 400;
    throw err;
  }
  const existing = await Agent.findOne({ phoneNumberId });
  if (existing) {
    const err = new Error("Este agente ya está registrado");
    err.status = 400;
    throw err;
  }

  const count = await Agent.countDocuments({ userId });
  if (count >= limitsConfig.maxAgentsPerUser) {
    const err = new Error("Límite de 3 agentes por usuario alcanzado");
    err.status = 400;
    throw err;
  }

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
    .select("name phoneNumberId payloadFormat authMode description")
    .sort({ createdAt: -1 });
};

/**
 * Actualiza el fieldMapping de un agente si su formato lo permite.
 *
 * @param {string} userId - ID del usuario autenticado
 * @param {string} agentId - ID del agente a modificar
 * @param {Object} newMapping - Nuevo objeto de mapeo
 * @returns {Promise<Agent>} - Agente actualizado
 * @throws {Error} - Si el agente no existe o su formato es "structured"
 */

export const updateAgentMapping = async (userId, agentId, newMapping) => {
  const agent = await Agent.findOne({ _id: agentId, userId });
  if (!agent) {
    const err = new Error("Agente no encontrado");
    err.status = 404;
    throw err;
  }

  if (agent.payloadFormat === "structured") {
    const err = new Error("field_mapping_not_allowed_with_structured_format");
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

/**
 * Actualiza los datos de un agente con validación de negocio.
 *
 * @param {string} userId - ID del usuario autenticado
 * @param {string} agentId - ID del agente a actualizar
 * @param {Object} updates - Datos de actualización
 * @returns {Promise<Agent>} - Agente actualizado
 * @throws {Error} - Si no se encuentra o la lógica es inválida
 */
export const updateAgentService = async (userId, agentId, updates) => {
  const agent = await Agent.findOne({ _id: agentId, userId });
  if (!agent) {
    const error = new Error("Agente no encontrado");
    error.status = 404;
    throw error;
  }

  const nextPayloadFormat = updates.payloadFormat || agent.payloadFormat;
  const nextFieldMapping =
    updates.fieldMapping !== undefined
      ? updates.fieldMapping
      : agent.fieldMapping;

  const logicError = validateAgentLogic({
    payloadFormat: nextPayloadFormat,
    fieldMapping: nextFieldMapping,
  });
  if (logicError) {
    const err = new Error(logicError);
    err.status = 400;
    throw err;
  }

  if (updates.payloadFormat === "structured") {
    updates.fieldMapping = {}; // borrar mapping si cambia a structured
  }

  Object.assign(agent, updates);
  await agent.save();
  return agent;
};
