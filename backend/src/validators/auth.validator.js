import { z } from "zod";

/**
 * Schema for validating user registration data.
 * Requires valid email format, minimum 8-character password, and non-empty name.
 * Email is automatically transformed to lowercase and trimmed.
 *
 * @type {import('zod').ZodObject}
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Invalid email format" })
      .transform((str) => str.toLowerCase().trim()),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    name: z.string().min(1, { message: "Name cannot be empty" }),
  })
  .strict();

/**
 * Schema for validating user login credentials.
 * Requires valid email format and minimum 8-character password.
 * Email is automatically transformed to lowercase and trimmed.
 *
 * @type {import('zod').ZodObject}
 */
export const loginSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Invalid email format" })
      .transform((str) => str.toLowerCase().trim()),
    password: z.string().min(8, { message: "Invalid password" }),
  })
  .strict();
