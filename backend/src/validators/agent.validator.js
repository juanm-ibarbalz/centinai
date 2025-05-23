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
        Object.keys(mapping).includes(key),
      ))
  ) {
    return "El fieldMapping debe incluir como mínimo: text, from y timestamp";
  }

  return null;
};

/**
 * Valida el PATCH de mapping: estructura, existencia del agente y lógica cruzada.
 *
 * @param {Object} req - Request de Express
 * @returns {Promise<{ fieldMapping: Object, agent: Object }> }
 * @throws {Object} - Error con status y message
 */
export const validateUpdateMappingRequest = async (req) => {
  const result = agentValidationSchema.partial().safeParse(req.body);
  if (!result.success) {
    throw {
      status: 400,
      message: "invalid_payload",
      zod: result.error.format(),
    };
  }

  const fieldMapping = result.data.fieldMapping;

  const agent = await Agent.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!agent) {
    throw { status: 404, message: "agent_not_found" };
  }

  if (agent.payloadFormat === "structured") {
    throw {
      status: 400,
      message: "field_mapping_not_allowed_with_structured_format",
    };
  }

  const logicError = validateAgentLogic({
    payloadFormat: agent.payloadFormat,
    fieldMapping,
  });

  if (logicError) {
    throw { status: 400, message: logicError };
  }

  return { fieldMapping, agent };
};
