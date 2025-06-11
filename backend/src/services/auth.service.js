import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateUserId } from "../utils/idGenerator.js";
import { authConfig } from "../config/config.js";

/**
 * Genera un token JWT con los datos mínimos del usuario.
 * @param {Object} user - Usuario autenticado
 * @param {string} user._id - ID del usuario
 * @param {string} user.email - Email del usuario
 * @returns {string} - Token JWT firmado
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn },
  );
};

/**
 * Registra un nuevo usuario si el email no está en uso.
 * @param {Object} data - Datos del usuario
 * @param {string} data.email - Email único
 * @param {string} data.password - Contraseña sin encriptar
 * @param {string} data.name - Nombre visible del usuario
 * @returns {Promise<User>} - Usuario recién creado
 * @throws {Error} - Si el email ya está registrado
 */
export const registerUser = async ({ email, password, name }) => {
  const hashed = await bcrypt.hash(password, 10);
  const userId = generateUserId();

  const user = new User({ _id: userId, email, password: hashed, name });
  await user.save();
  return user;
};

/**
 * Verifica la password y devuelve un token de sesión, iniciandola.
 * @param {Object} user - Usuario a iniciar sesión
 * @param {string} password - Contraseña sin encriptar
 * @returns {Promise<string>} - JWT generado
 * @throws {Error} - Si las credenciales no son válidas
 */
export const loginUser = async (user, password) => {
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  user.last_login_at = new Date();
  await user.save();

  const token = generateToken(user);
  return token;
};
