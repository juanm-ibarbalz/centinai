import { z } from "zod";

export const listMetricsQuerySchema = z.object({
  agentPhoneNumberId: z.string().min(1, {
    message: "El ID del número de teléfono del agente es obligatorio",
  }),
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

export const getMetricParamsSchema = z.object({
  conversationId: z.string().nonempty("conversationId es obligatorio"),
});
