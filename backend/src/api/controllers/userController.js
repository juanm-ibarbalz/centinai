import {
  updateUserService,
  changeUserPassword,
} from "../../services/user.service.js";
import {
  updateUserSchema,
  changePasswordSchema,
} from "../../validators/user.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import User from "../../models/User.js";

/**
 * Updates the authenticated user's profile information.
 * Validates the request body using Zod schema, checks for duplicate emails,
 * and updates the user's information in the database.
 *
 * @route PATCH /users/me
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user update data
 * @param {string} [req.body.email] - New email address (optional)
 * @param {string} [req.body.name] - New full name (optional)
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status and updated user data or error
 * @throws {400} When request body validation fails or no changes detected
 * @throws {404} When user is not found
 * @throws {409} When email is already in use by another user
 * @throws {500} When server error occurs during update
 */
export const updateUserController = async (req, res) => {
  const update = req.body;
  const result = updateUserSchema.safeParse(update);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload", result.error);
  }

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 404, "user_not_found");

  const email = update.email;
  const name = update.name;
  if (email && email === user.email) {
    return sendError(res, 400, "invalid_payload", {
      message: "Email has not changed",
    });
  }

  if (name && name === user.name) {
    return sendError(res, 400, "invalid_payload", {
      message: "Name has not changed",
    });
  }

  if (email) {
    const existing = await User.findOne({ email: email });
    if (existing) {
      return sendError(res, 400, "invalid_payload", {
        message: "Email is already in use",
      });
    }
  }

  try {
    const updated = await updateUserService(user, result.data);
    return sendSuccess(res, 200, {
      message: "User updated successfully",
      user: {
        id: updated._id,
        email: updated.email,
        name: updated.name,
      },
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Changes the authenticated user's password.
 * Validates the request body using Zod schema, verifies current password,
 * and updates the user's password in the database.
 *
 * @route PATCH /users/me/password
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing password change data
 * @param {string} req.body.currentPassword - User's current password for verification
 * @param {string} req.body.newPassword - New password to set
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status or error
 * @throws {400} When request body validation fails
 * @throws {401} When current password is incorrect
 * @throws {404} When user is not found
 * @throws {500} When server error occurs during password change
 */
export const changePasswordController = async (req, res) => {
  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload", result.error);
  }

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 404, "user_not_found");

  try {
    await changeUserPassword(
      user,
      result.data.currentPassword,
      result.data.newPassword
    );

    return sendSuccess(res, 200, {
      message: "Password updated successfully",
    });
  } catch (err) {
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
