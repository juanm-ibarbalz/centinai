import { registerUser, loginUser } from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: "Usuario creado", user: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);
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
