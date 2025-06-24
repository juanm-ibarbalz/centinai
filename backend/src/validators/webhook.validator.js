import { z } from "zod";

/**
 * Validates webhook authentication by checking for agent secret in multiple locations.
 * Accepts the secret token from any of the following sources:
 *  • Query parameter `secret`
 *  • Header `x-agent-secret`
 *  • Body field `agentSecret`
 * Unifies the value into a single `secret` property for consistent processing.
 *
 * @type {import('zod').ZodObject}
 */
export const webhookAuthSchema = z
  .object({
    secret: z.string().optional(),
    xAgentSecret: z.string().optional(),
    agentSecret: z.string().optional(),
  })
  .refine(
    (data) => Boolean(data.secret || data.xAgentSecret || data.agentSecret),
    { message: "Secret is required in query, header, or body" }
  )
  .transform((data) => ({
    secret: data.secret ?? data.xAgentSecret ?? data.agentSecret,
  }));
