import { z } from "zod";
import Agent from "../models/Agent.js";

/**
 * Esquema base de validación para agentes.
 * Solo valida la estructura (campos esperados y tipos), sin reglas lógicas.
 */
export const agentValidationSchema = z.object({
  phoneNumberId: z.string().min(1, "El phoneNumberId es obligatorio"),
  name: z.string().min(1, "El nombre del agente es obligatorio"),
  description: z.string().optional(),
  integrationMode: z.enum(["structured", "custom-mapped", "query-only"], {
    required_error: "El modo de integración es obligatorio",
  }),
  fieldMapping: z.record(z.string(), z.string()).optional(),
});

/**
 * Valida reglas de negocio adicionales para un agente.
 * Separa lógica como restricciones de uso de fieldMapping por modo de integración.
 *
 * @param {Object} data - Objeto ya parseado con los datos del agente
 * @returns {string|null} - Mensaje de error si hay problema, o null si es válido
 */
export const validateAgentLogic = (data) => {
  if (
    data.integrationMode === "structured" &&
    data.fieldMapping &&
    Object.keys(data.fieldMapping).length > 0
  ) {
    return "No se permite definir fieldMapping con integración tipo 'structured'";
  }

  if (
    data.integrationMode === "custom-mapped" &&
    (!data.fieldMapping ||
      !["text", "from", "timestamp"].every((key) =>
        Object.keys(data.fieldMapping).includes(key),
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
 * @returns {Promise<{ fieldMapping: Object, agent: Object }>}
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

  const logicError = validateAgentLogic({
    integrationMode: agent.integrationMode,
    fieldMapping,
  });

  if (logicError) {
    throw { status: 400, message: logicError };
  }

  return { fieldMapping, agent };
};
