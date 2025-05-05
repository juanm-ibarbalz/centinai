import { registerUser, loginUser } from "../../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../../validators/auth.validator.js";

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
