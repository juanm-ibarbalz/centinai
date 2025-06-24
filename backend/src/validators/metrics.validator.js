import { z } from "zod";

/**
 * Base pagination schema for metrics queries.
 * Provides common pagination parameters with default values and validation.
 *
 * @type {import('zod').ZodObject}
 */
const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 20))
    .refine((v) => !isNaN(v) && v >= 0, {
      message: "Limit must be an integer greater than or equal to 0",
    }),
  offset: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : 0))
    .refine((v) => !isNaN(v) && v >= 0, {
      message: "Offset must be an integer greater than or equal to 0",
    }),
});

/**
 * Schema for validating metrics queries with agent filtering.
 * Extends pagination schema with required agent phone number identifier.
 *
 * @type {import('zod').ZodObject}
 */
export const listMetricsQuerySchema = paginationSchema.extend({
  agentPhoneNumberId: z.string().min(1, {
    message: "Agent phone number is required",
  }),
});

/**
 * Schema for validating metrics queries without agent filtering.
 * Returns all metrics for the authenticated user across all agents.
 *
 * @type {import('zod').ZodObject}
 */
export const listAllMetricsQuerySchema = paginationSchema;

/**
 * Schema for validating metric retrieval by conversation ID.
 * Used for getting detailed metrics for a specific conversation.
 *
 * @type {import('zod').ZodObject}
 */
export const getMetricParamsSchema = z.object({
  conversationId: z.string().nonempty("Conversation ID is required"),
});
