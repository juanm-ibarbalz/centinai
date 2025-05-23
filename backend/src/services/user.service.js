import bcrypt from "bcrypt";
import User from "../models/User.js";

/**
 * Actualiza los datos del usuario autenticado.
 * @param {string} userId
 * @param {Object} updates - Puede incluir name y/o email
 * @returns {Promise<User>}
 */
export const updateUserService = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  if (updates.email && updates.email !== user.email) {
    const existing = await User.findOne({ email: updates.email });
    if (existing) {
      const error = new Error("El email ya está en uso");
      error.status = 400;
      throw error;
    }
  }

  Object.assign(user, updates);
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
  userId,
  currentPassword,
  newPassword,
) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

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
