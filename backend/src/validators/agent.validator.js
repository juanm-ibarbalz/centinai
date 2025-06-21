import { z } from "zod";
import Agent from "../models/Agent.js";

/**
 * Base validation schema for AI agent creation and configuration.
 * Validates all required fields for agent setup including phone number,
 * name, payload format, authentication mode, and AI model.
 *
 * @type {import('zod').ZodObject}
 */
export const agentValidationSchema = z.object({
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  name: z.string().min(1, "Agent name is required"),
  description: z.string().optional(),

  payloadFormat: z.enum(["structured", "custom"], {
    required_error: "Payload format is required",
  }),

  authMode: z.enum(["query", "header", "body"], {
    required_error: "Authentication mode is required",
  }),

  fieldMapping: z.record(z.string(), z.string()).optional(),
  modelName: z.string().min(1, "AI model name is required"),
});

/**
 * Validates additional business logic rules for agent configuration.
 * Ensures proper field mapping based on payload format:
 * - structured format: no field mapping allowed
 * - custom format: must include text, from, timestamp, and to mappings
 *
 * @param {Object} data - Parsed agent data object
 * @param {'structured'|'custom'} data.payloadFormat - Payload format type
 * @param {Object} [data.fieldMapping] - Field mapping configuration
 * @returns {string|null} Error message if validation fails, null if valid
 */
export const validateAgentLogic = (data) => {
  const mapping = data.fieldMapping || {};

  if (data.payloadFormat === "structured" && Object.keys(mapping).length > 0) {
    return "Field mapping is not allowed with 'structured' format";
  }

  if (
    data.payloadFormat === "custom" &&
    (!mapping ||
      !["text", "from", "timestamp", "to"].every((key) =>
        Object.keys(mapping).includes(key)
      ))
  ) {
    return "Field mapping must include at minimum: text, from, timestamp, and to";
  }

  return null;
};

/**
 * Schema for validating partial agent updates.
 * All fields are optional, allowing selective updates of agent properties.
 *
 * @type {import('zod').ZodObject}
 */
export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  payloadFormat: z.enum(["structured", "custom"]).optional(),
  authMode: z.enum(["query", "header", "body"]).optional(),
  fieldMapping: z.record(z.string(), z.string()).optional(),
  modelName: z.string().min(1).optional(),
});
