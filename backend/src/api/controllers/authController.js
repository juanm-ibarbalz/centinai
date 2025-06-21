import { registerUser, loginUser } from "../../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../../validators/auth.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import User from "../../models/User.js";

/**
 * Controlador para registrar un nuevo usuario.
 * Valida el cuerpo de la solicitud, que el usuario no exista y crea el usuario en la base de datos.
 * @route POST /auth/register
 * @param {Request} req
 * @param {Response} res
 */
export const register = async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "invalid_payload", result.error);
  }

  const existingUser = await User.findOne({ email: result.data.email });
  if (existingUser) {
    return sendError(res, 409, "invalid_credentials");
  }

  try {
    const user = await registerUser(result.data);
    return sendSuccess(res, 201, {
      message: "Usuario creado",
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    return sendError(res, err.status || 500, err.message || "server_error");
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
    return sendError(res, 400, "invalid_payload", result.error);
  }

  const user = await User.findOne({ email: result.data.email });
  if (!user) {
    return sendError(res, 401, "invalid_credentials");
  }

  try {
    const token = await loginUser(user, result.data.password);
    return sendSuccess(res, 200, {
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.name,
      },
    });
  } catch (err) {
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
