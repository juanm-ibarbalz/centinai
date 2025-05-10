import { z } from "zod";

/**
 * Esquema para validar los datos del registro de un nuevo usuario.
 * Exige email válido, contraseña mínima de 8 caracteres y nombre no vacío.
 */
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

/**
 * Esquema para validar las credenciales de inicio de sesión.
 * Exige email válido y contraseña con al menos 8 caracteres.
 */
export const loginSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Email inválido" })
      .transform((str) => str.toLowerCase().trim()),
    password: z.string().min(8, { message: "Contraseña inválida" }),
  })
  .strict();
