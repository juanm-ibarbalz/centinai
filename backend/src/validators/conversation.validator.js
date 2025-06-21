import { z } from "zod";

/**
 * Schema for validating conversation query parameters.
 * Handles pagination, sorting, and date range filtering for conversation retrieval.
 * Transforms string parameters to appropriate types and provides default values.
 *
 * @type {import('zod').ZodObject}
 */
export const getConversationsQuerySchema = z.object({
  agentPhoneNumberId: z.string().min(1, "agentPhoneNumberId is required"),
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 20))
    .refine((v) => !isNaN(v) && v >= 0, "limit must be an integer ≥ 0"),
  offset: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 0))
    .refine((v) => !isNaN(v) && v >= 0, "offset must be an integer ≥ 0"),
  sortBy: z
    .string()
    .optional()
    .refine((v) => !v || ["duration", "cost", "date"].includes(v), {
      message: "Invalid sortBy value",
    }),
  sortOrder: z
    .string()
    .optional()
    .refine((v) => !v || ["asc", "desc"].includes(v), {
      message: "Invalid sortOrder value",
    }),
  dateFrom: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), {
      message: "dateFrom must be a valid ISO date",
    })
    .transform((v) => (v ? new Date(v) : undefined)),
  dateTo: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), {
      message: "dateTo must be a valid ISO date",
    })
    .transform((v) => (v ? new Date(v) : undefined)),
});
