import Agent from "../models/Agent.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { generateAgentId } from "../utils/idGenerator.js";

/**
 * Crea un nuevo agente para un usuario dado si el número de teléfono no está ya registrado
 * y el usuario no superó el límite de agentes permitidos.
 * @param {Object} data - Datos necesarios para crear el agente
 * @param {string} data.userId - ID del usuario dueño del agente
 * @param {string} data.phoneNumberId - Número de teléfono (ID de WhatsApp Business)
 * @param {string} data.name - Nombre del agente
 * @param {string} [data.description] - Descripción opcional del agente
 * @returns {Promise<Agent>} - Agente recién creado
 * @throws {Error} - Si ya existe un agente con el mismo número o se supera el límite
 */
export const createAgent = async ({
  userId,
  phoneNumberId,
  name,
  description,
}) => {
  const existing = await Agent.findOne({ phoneNumberId });
  if (existing) throw new Error("Este agente ya está registrado");

  const count = await Agent.countDocuments({ userId });
  if (count >= 3) throw new Error("Límite de 3 agentes por usuario alcanzado");

  const agentId = generateAgentId(userId);

  const agent = new Agent({
    _id: agentId,
    userId,
    phoneNumberId,
    name,
    description,
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
  return Agent.find({ userId }).sort({ createdAt: -1 });
};
