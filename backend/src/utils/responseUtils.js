import { errorMessages } from "./errorMessages.js";
import { ZodError } from "zod";

/**
 * Envía una respuesta de error estandarizada.
 * @param {Response} res
 * @param {number} statusCode
 * @param {string} keyOrMessage - Clave de error definida o mensaje personalizado
 * @param {string|ZodError} [description] - Descripción adicional o ZodError
 */
export const sendError = (res, statusCode, keyOrMessage, description) => {
  const message = errorMessages[keyOrMessage] || keyOrMessage;

  // si me pasan un ZodError, lo formateo
  let details = description;
  if (description instanceof ZodError) {
    const { fieldErrors } = description.flatten();
    details = Object.fromEntries(
      Object.entries(fieldErrors)
        .filter(([, msgs]) => msgs.length > 0)
        .map(([field, msgs]) => [field, msgs.join(", ")]),
    );
  }

  const payload = { error: message };
  if (details !== undefined) payload.description = details;

  return res.status(statusCode).json(payload);
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
