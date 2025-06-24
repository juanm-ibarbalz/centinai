import { errorMessages } from "./errorMessages.js";
import { ZodError } from "zod";

/**
 * Sends a standardized error response with consistent format.
 * Handles both predefined error keys and custom error messages.
 * Automatically formats ZodError instances for better error reporting.
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code for the error response
 * @param {string} keyOrMessage - Predefined error key from errorMessages or custom error message
 * @param {string|ZodError} [description] - Additional error description or ZodError instance
 * @returns {Object} Express response with error payload
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
        .map(([field, msgs]) => [field, msgs.join(", ")])
    );
  }

  const payload = { error: message };
  if (details !== undefined) payload.description = details;

  return res.status(statusCode).json(payload);
};

/**
 * Sends a standardized success response with uniform format.
 * Provides consistent response structure for successful API calls.
 *
 * @param {Object} res - Express response object
 * @param {number} [statusCode=200] - HTTP status code for the success response
 * @param {Object} [data={}] - Data payload to include in the response
 * @returns {Object} Express response with success payload
 */
export const sendSuccess = (res, statusCode = 200, data = {}) => {
  return res.status(statusCode).json(data);
};
