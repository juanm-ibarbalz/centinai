import bcrypt from "bcrypt";
import User from "../models/User.js";

/**
 * Updates the authenticated user's profile information.
 * Allows updating name and/or email fields while preserving other user data.
 * Only updates fields that are provided in the updates object.
 *
 * @param {Object} user - User object to update
 * @param {string} user._id - User's unique identifier
 * @param {string} user.email - User's current email address
 * @param {string} user.name - User's current display name
 * @param {Object} updates - Object containing fields to update
 * @param {string} [updates.name] - New display name (optional)
 * @param {string} [updates.email] - New email address (optional)
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} When validation fails or database operation fails
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
 * Changes the authenticated user's password after validating the current password.
 * Verifies the current password before allowing the change and securely
 * hashes the new password before saving.
 *
 * @param {Object} user - User object whose password will be changed
 * @param {string} user._id - User's unique identifier
 * @param {string} user.password - User's current hashed password
 * @param {string} currentPassword - Plain text current password for verification
 * @param {string} newPassword - Plain text new password to set
 * @returns {Promise<void>} Resolves when password is successfully changed
 * @throws {Error} When current password is incorrect (status: 401)
 */
export const changeUserPassword = async (
  user,
  currentPassword,
  newPassword
) => {
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    const error = new Error("Current password is incorrect");
    error.status = 401;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();
};
