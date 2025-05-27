import { v4 as uuidv4 } from "uuid";
import { idConfig } from "../config/config.js";

/**
 * Genera un ID único para una conversación combinando prefijo, origen, agente y UUID.
 * @param {string} from - Número del usuario
 * @param {string} agentId - ID del agente o phoneNumberId
 * @returns {string} - ID único de conversación
 */
export const generateConversationId = (from, agentId) => {
  return `${idConfig.conversationPrefix}-${from}-${agentId}-${uuidv4()}`;
};

/**
 * Genera un ID único para un agente combinando prefijo, userId y UUID.
 * @param {string} userId - ID del usuario dueño del agente
 * @returns {string} - ID único del agente
 */
export const generateAgentId = (userId) => {
  return `${idConfig.agentPrefix}-${userId}-${uuidv4()}`;
};

/**
 * Genera un ID único para un usuario usando solo UUID.
 * @returns {string} - ID único del usuario
 */
export const generateUserId = () => {
  return `${idConfig.userPrefix}-${uuidv4()}`;
};

/**
 * Genera un ID único para un mensaje en base al ID de la conversación.
 * @param {string} conversationId - ID de la conversación asociada
 * @returns {string} - ID único del mensaje
 */
export const generateMessageId = (conversationId) => {
  return `${idConfig.messagePrefix}-${conversationId}-${uuidv4()}`;
};

/**
 * Genera un ID único de sesión
 * @returns {string} - ID de sesión
 */
export const generateSessionId = () => {
  return `${idConfig.sessionPrefix}-${uuidv4()}`;
};

/**
 * Genera un ID único de batch
 * @returns {string} - ID de batch
 */
export const generateBatchId = () => {
  return `${idConfig.batchPrefix}-${uuidv4()}`;
};
