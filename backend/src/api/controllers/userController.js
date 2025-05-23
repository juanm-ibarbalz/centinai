import {
  updateUserService,
  changeUserPassword,
} from "../../services/user.service.js";
import {
  updateUserSchema,
  changePasswordSchema,
} from "../../validators/user.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";

/**
 * Actualiza datos del usuario autenticado.
 * @route PATCH /users/me
 * @param {Request} req
 * @param {Response} res
 */
export const updateUserController = async (req, res) => {
  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload");
  }

  try {
    const updated = await updateUserService(req.user.id, result.data);
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
    return sendError(res, 400, "invalid_payload");
  }

  try {
    await changeUserPassword(
      req.user.id,
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
