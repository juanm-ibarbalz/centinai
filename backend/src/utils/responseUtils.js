import { errorMessages } from "./errorMessages.js";

/**
 * Envía una respuesta de error estandarizada.
 * @param {Response} res
 * @param {number} statusCode
 * @param {string} keyOrMessage - Clave de error definida o mensaje personalizado
 */
export const sendError = (res, statusCode, keyOrMessage) => {
  const message = errorMessages[keyOrMessage] || keyOrMessage;
  return res.status(statusCode).json({ error: message });
};

/**
 * Envía una respuesta exitosa con formato uniforme.
 * @param {Response} res
 * @param {number} statusCode
 * @param {object} data
 */
export const sendSuccess = (res, statusCode = 200, data = {}) => {
  return res.status(statusCode).json(data);
};
