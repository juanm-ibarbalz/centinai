import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Email inválido" })
      .transform((str) => str.toLowerCase().trim()),

    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
    name: z.string().min(1, { message: "El nombre no puede estar vacío" }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Email inválido" })
      .transform((str) => str.toLowerCase().trim()),
    password: z.string().min(8, { message: "Contraseña inválida" }),
  })
  .strict();
