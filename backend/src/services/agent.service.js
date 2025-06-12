import crypto from "crypto";
import Agent from "../models/Agent.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { generateAgentId } from "../utils/idGenerator.js";

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
 * @param {string} [data.modelName] - Nombre del modelo asociado al agente
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
 * Elimina un agente por ID y todos sus datos relacionados, validando propiedad.
 * @param {string} phoneNumberId - ID del número de teléfono del agente a eliminar
 * @returns {Promise<void>}
 * @throws {Error} - Si el agente no existe o no pertenece al usuario
 */
export const deleteAgentWithCascade = async (phoneNumberId) => {
  const conversations = await Conversation.find({
    agentPhoneNumberId: phoneNumberId,
  });
  const conversationIds = conversations.map((c) => c._id);

  await Message.deleteMany({ conversationId: { $in: conversationIds } });
  await Conversation.deleteMany({ agentPhoneNumberId: phoneNumberId });
  await Agent.deleteOne({ phoneNumberId });
};

/**
 * Devuelve todos los agentes pertenecientes a un usuario.
 * @param {string} userId
 * @returns {Promise<Agent[]>}
 */
export const getAgentsByUser = async (userId) => {
  return Agent.find({ userId })
    .select("name phoneNumberId payloadFormat authMode description modelName")
    .sort({ createdAt: 1 });
};

/**
 * Actualiza el fieldMapping de un agente.
 *
 * @param {string} agentId - ID del agente a modificar
 * @param {Object} fieldMapping - Nuevo objeto de mapeo
 * @returns {Promise<Object>} - FieldMapping actualizado
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
 * Regenera el secretToken de un agente y lo devuelve.
 *
 * @param {string} agentId - ID del agente a actualizar
 * @returns {Promise<string>} - Nuevo token generado
 * @throws {Error} - Si el agente no existe o no pertenece al usuario
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
 * Actualiza los datos de un agente.
 *
 * @param {string} agentId - ID del agente a actualizar
 * @param {Object} data - Datos de actualización
 * @returns {Promise<Agent>} - Agente actualizado
 * @throws {Error} - Si no se encuentra o la lógica es inválida
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

  // si se actualiza a "structured", eliminamos el fieldMapping
  if (data.payloadFormat === "structured") {
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
