import { z } from "zod";

export const getConversationsQuerySchema = z.object({
  agentPhoneNumberId: z.string().min(1, "agentPhoneNumberId es obligatorio"),
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 20))
    .refine((v) => !isNaN(v) && v >= 0, "limit debe ser un entero ≥ 0"),
  offset: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 0))
    .refine((v) => !isNaN(v) && v >= 0, "offset debe ser un entero ≥ 0"),
  sortBy: z
    .string()
    .optional()
    .refine((v) => ["duration", "cost", "date"].includes(v), {
      message: "sortBy inválido",
    }),
  sortOrder: z
    .string()
    .optional()
    .refine((v) => ["asc", "desc"].includes(v), {
      message: "sortOrder inválido",
    }),
  dateFrom: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), {
      message: "dateFrom debe ser fecha ISO válida",
    })
    .transform((v) => (v ? new Date(v) : undefined)),
  dateTo: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), {
      message: "dateTo debe ser fecha ISO válida",
    })
    .transform((v) => (v ? new Date(v) : undefined)),
});
