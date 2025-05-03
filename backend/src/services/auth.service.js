import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateUserId } from "../utils/idGenerator.js";

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
};

export const registerUser = async ({ email, password, name }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email ya registrado");

  const hashed = await bcrypt.hash(password, 10);
  const userId = generateUserId();

  const user = new User({ _id: userId, email, password: hashed, name });
  await user.save();
  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Contraseña incorrecta");

  user.last_login_at = new Date();
  await user.save();

  const token = generateToken(user);
  return { user, token };
};
