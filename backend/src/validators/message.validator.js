import { z } from "zod";

/**
 * Schema for validating message query parameters.
 * Handles pagination for message retrieval within a specific conversation.
 * Transforms string parameters to integers and provides default values.
 *
 * @type {import('zod').ZodObject}
 */
export const listMessagesQuerySchema = z.object({
  conversationId: z.string().min(1, {
    message: "Conversation ID is required",
  }),
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
