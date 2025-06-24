import { z } from "zod";

/**
 * Schema for validating user profile updates (name, email).
 * Both fields are optional, allowing partial updates.
 * Email is validated for proper format if provided.
 *
 * @type {import('zod').ZodObject}
 */
export const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .strict();

/**
 * Schema for validating user password change requests.
 * Requires current password for verification and new password with minimum length.
 *
 * @type {import('zod').ZodObject}
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});
