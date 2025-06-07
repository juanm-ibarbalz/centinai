import { z } from "zod";

/**
 * Valida que venga el secret del agente en alguno de:
 *  • query param `secret`
 *  • header `x-agent-secret`
 *  • body field `agentSecret`
 * Y unifica el valor en la propiedad `secret`.
 */
export const webhookAuthSchema = z
  .object({
    secret: z.string().optional(),
    xAgentSecret: z.string().optional(),
    agentSecret: z.string().optional(),
  })
  .refine(
    (data) => Boolean(data.secret || data.xAgentSecret || data.agentSecret),
    { message: "Se requiere secret en query, header o body" },
  )
  .transform((data) => ({
    secret: data.secret ?? data.xAgentSecret ?? data.agentSecret,
  }));
