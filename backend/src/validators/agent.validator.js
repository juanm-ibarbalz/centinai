import { z } from "zod";

/**
 * Esquema de validación para la creación de un nuevo agente.
 * Valida que tenga al menos phoneNumberId y name.
 */
export const createAgentSchema = z
  .object({
    phoneNumberId: z
      .string()
      .min(1, { message: "El phoneNumberId es obligatorio" }),
    name: z.string().min(1, { message: "El nombre del agente es obligatorio" }),
    description: z.string().optional(),
  })
  .strict();
