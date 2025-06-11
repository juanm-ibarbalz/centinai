import bcrypt from "bcrypt";
import User from "../models/User.js";

/**
 * Actualiza los datos del usuario autenticado.
 * @param {User} user
 * @param {Object} updates - Puede incluir name y/o email
 * @returns {Promise<User>}
 */
export const updateUserService = async (user, updates) => {
  const allowed = ["name", "email"];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      user[key] = updates[key];
    }
  }

  await user.save();
  return user;
};

/**
 * Cambia la contraseña de un usuario autenticado, validando la actual.
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export const changeUserPassword = async (
  user,
  currentPassword,
  newPassword,
) => {
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    const error = new Error("Contraseña actual incorrecta");
    error.status = 401;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();
};
