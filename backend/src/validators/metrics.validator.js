import { z } from "zod";

/**
 * Base schema for date range filtering.
 * Provides common date filtering parameters with validation and transformation.
 *
 * @type {import('zod').ZodObject}
 */
const dateFilterSchema = z.object({
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

/**
 * Schema for validating metrics queries with agent filtering.
 * Includes date range filtering without pagination.
 *
 * @type {import('zod').ZodObject}
 */
export const listMetricsQuerySchema = dateFilterSchema.extend({
  agentPhoneNumberId: z.string().min(1, {
    message: "Agent phone number is required",
  }),
});

/**
 * Schema for validating metrics queries without agent filtering.
 * Returns all metrics for the authenticated user across all agents with date filtering.
 *
 * @type {import('zod').ZodObject}
 */
export const listAllMetricsQuerySchema = dateFilterSchema;

/**
 * Schema for validating metric retrieval by conversation ID.
 * Used for getting detailed metrics for a specific conversation.
 *
 * @type {import('zod').ZodObject}
 */
export const getMetricParamsSchema = z.object({
  conversationId: z.string().nonempty("Conversation ID is required"),
});
