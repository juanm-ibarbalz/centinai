import { z } from "zod";

/**
 * Valida actualizaciones de perfil (nombre, email).
 */
export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

/**
 * Valida el cambio de contraseña del usuario.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "La contraseña actual es requerida"),
  newPassword: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});
