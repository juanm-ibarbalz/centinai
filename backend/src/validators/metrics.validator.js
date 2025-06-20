import { z } from "zod";

const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 20))
    .refine((v) => !isNaN(v) && v >= 0, {
      message: "El límite debe ser un número entero mayor o igual a 0",
    }),
  offset: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 0))
    .refine((v) => !isNaN(v) && v >= 0, {
      message: "El offset debe ser un número entero mayor o igual a 0",
    }),
});

export const listMetricsQuerySchema = paginationSchema.extend({
  agentPhoneNumberId: z.string().min(1, {
    message: "El número del agente es obligatorio",
  }),
});

export const listAllMetricsQuerySchema = paginationSchema;

export const getMetricParamsSchema = z.object({
  conversationId: z
    .string()
    .nonempty("El ID de la conversación es obligatorio"),
});
