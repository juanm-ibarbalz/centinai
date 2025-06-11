import { z } from "zod";
import Agent from "../models/Agent.js";

/**
 * Esquema base de validación para agentes.
 */
export const agentValidationSchema = z.object({
  phoneNumberId: z.string().min(1, "El phoneNumberId es obligatorio"),
  name: z.string().min(1, "El nombre del agente es obligatorio"),
  description: z.string().optional(),

  payloadFormat: z.enum(["structured", "custom"], {
    required_error: "El formato del payload es obligatorio",
  }),

  authMode: z.enum(["query", "header", "body"], {
    required_error: "El modo de autenticación es obligatorio",
  }),

  fieldMapping: z.record(z.string(), z.string()).optional(),
  modelName: z
    .string()
    .min(1, "El nombre del modelo del agente es obligatorio"),
});

/**
 * Valida reglas de negocio adicionales para un agente.
 * - structured → no debe tener fieldMapping
 * - custom → debe tener text, from y timestamp en el mapping
 *
 * @param {Object} data - Objeto ya parseado con los datos del agente
 * @returns {string|null} - Mensaje de error si hay problema, o null si es válido
 */
export const validateAgentLogic = (data) => {
  const mapping = data.fieldMapping || {};

  if (data.payloadFormat === "structured" && Object.keys(mapping).length > 0) {
    return "No se permite definir fieldMapping con formato 'structured'";
  }

  if (
    data.payloadFormat === "custom" &&
    (!mapping ||
      !["text", "from", "timestamp"].every((key) =>
        Object.keys(mapping).includes(key)
      ))
  ) {
    return "El fieldMapping debe incluir como mínimo: text, from y timestamp";
  }

  return null;
};

/**
 * Esquema de validación para actualización parcial de agentes.
 */
export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  payloadFormat: z.enum(["structured", "custom"]).optional(),
  authMode: z.enum(["query", "header", "body"]).optional(),
  fieldMapping: z.record(z.string(), z.string()).optional(),
  modelName: z.string().min(1).optional(),
});
