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
 * Actualiza datos del usuario autenticado.
 * @route PATCH /users/me
 * @param {Request} req
 * @param {Response} res
 */
export const updateUserController = async (req, res) => {
  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload", parsed.error);
  }

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, 404, "user_not_found");

  if (result.email == user.email) {
    return sendError(res, 400, "invalid_payload", {
      message: "El email no ha cambiado",
    });
  }

  const existing = await User.findOne({ email: updates.email });
  if (existing) {
    return sendError(res, 400, "invalid_payload", {
      message: "El email ya está en uso",
    });
  }

  try {
    const updated = await updateUserService(user, result.data);
    return sendSuccess(res, 200, {
      message: "Usuario actualizado correctamente",
      user: {
        id: updated._id,
        email: updated.email,
        name: updated.name,
      },
    });
  } catch (err) {
    console.error("Error actualizando usuario:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};

/**
 * Cambia la contraseña del usuario autenticado.
 * @route PATCH /users/me/password
 * @param {Request} req
 * @param {Response} res
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
      result.data.newPassword,
    );

    return sendSuccess(res, 200, {
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    console.error("Error al cambiar contraseña:", err);
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
