import Agent from "../models/Agent.js";
import { generateAgentId } from "../utils/idGenerator.js";

/**
 * Crea un nuevo agente para un usuario dado si el número de teléfono no está ya registrado.
 * @param {Object} data - Datos necesarios para crear el agente
 * @param {string} data.userId - ID del usuario dueño del agente
 * @param {string} data.phoneNumberId - Número de teléfono (ID de WhatsApp Business)
 * @param {string} data.name - Nombre del agente
 * @param {string} [data.description] - Descripción opcional del agente
 * @returns {Promise<Agent>} - Agente recién creado
 * @throws {Error} - Si ya existe un agente con el mismo número de teléfono
 */
export const createAgent = async ({
  userId,
  phoneNumberId,
  name,
  description,
}) => {
  const existing = await Agent.findOne({ phoneNumberId });
  if (existing) throw new Error("Este agente ya está registrado");

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
