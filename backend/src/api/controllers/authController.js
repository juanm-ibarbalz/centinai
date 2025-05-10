import { registerUser, loginUser } from "../../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../../validators/auth.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";

/**
 * Controlador para registrar un nuevo usuario.
 * Valida el cuerpo de la solicitud y crea el usuario en la base de datos.
 * @route POST /auth/register
 * @param {Request} req
 * @param {Response} res
 */
export const register = async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload");
  }

  try {
    const user = await registerUser(result.data);
    return sendSuccess(res, 201, {
      message: "Usuario creado",
      user: user.email,
    });
  } catch (err) {
    return sendError(res, 400, err.message || "generic_error");
  }
};

/**
 * Controlador para iniciar sesión de un usuario.
 * Valida las credenciales y devuelve un token JWT.
 * @route POST /auth/login
 * @param {Request} req
 * @param {Response} res
 */
export const login = async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload");
  }

  try {
    const { user, token } = await loginUser(result.data);
    return sendSuccess(res, 200, {
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        last_login_at: user.last_login_at,
      },
    });
  } catch (err) {
    return sendError(res, 401, err.message || "generic_error");
  }
};
