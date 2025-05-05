import { z } from "zod";

export const createAgentSchema = z
  .object({
    phoneNumberId: z
      .string()
      .min(1, { message: "El phoneNumberId es obligatorio" }),
    name: z.string().min(1, { message: "El nombre del agente es obligatorio" }),
    description: z.string().optional(),
  })
  .strict();
