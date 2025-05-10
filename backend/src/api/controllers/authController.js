import { registerUser, loginUser } from "../../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../../validators/auth.validator.js";

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
    return res.status(400).json({ error: result.error.flatten() });
  }

  try {
    const user = await registerUser(result.data);
    res.status(201).json({ message: "Usuario creado", user: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    return res.status(400).json({ error: result.error.flatten() });
  }

  try {
    const { user, token } = await loginUser(result.data);
    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        last_login_at: user.last_login_at,
      },
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
