import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateUserId } from "../utils/idGenerator.js";
import { authConfig } from "../config/config.js";

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, email: user.email }, // usamos user.userId personalizado
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn },
  );
};

export const registerUser = async ({ email, password, name }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email ya registrado");

  const hashed = await bcrypt.hash(password, 10);
  const userId = generateUserId(); // genera usr-uuid

  const user = new User({ userId, email, password: hashed, name }); // 👈 usamos userId como campo extra
  await user.save();
  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Credenciales inválidas");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Credenciales inválidas");

  user.last_login_at = new Date();
  await user.save();

  const token = generateToken(user);
  return { user, token };
};
