import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateUserId } from "../utils/idGenerator.js";
import { authConfig } from "../config/config.js";

/**
 * Generates a JWT token with minimal user data for authentication.
 * Creates a signed token containing user ID and email for session management.
 *
 * @param {Object} user - Authenticated user object
 * @param {string} user._id - User's unique identifier
 * @param {string} user.email - User's email address
 * @returns {string} Signed JWT token for authentication
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn }
  );
};

/**
 * Registers a new user account if the email is not already in use.
 * Hashes the password securely and creates a new user record in the database.
 *
 * @param {Object} data - User registration data
 * @param {string} data.email - Unique email address for the account
 * @param {string} data.password - Plain text password to be hashed
 * @param {string} data.name - User's display name
 * @returns {Promise<Object>} Newly created user object
 * @throws {Error} When email is already registered or validation fails
 */
export const registerUser = async ({ email, password, name }) => {
  const hashed = await bcrypt.hash(password, 10);
  const userId = generateUserId();

  const user = new User({ _id: userId, email, password: hashed, name });
  await user.save();
  return user;
};

/**
 * Authenticates user credentials and returns a session token.
 * Verifies the provided password against the stored hash and updates
 * the last login timestamp upon successful authentication.
 *
 * @param {Object} user - User object to authenticate
 * @param {string} user._id - User's unique identifier
 * @param {string} user.email - User's email address
 * @param {string} user.password - Hashed password stored in database
 * @param {string} password - Plain text password to verify
 * @returns {Promise<string>} JWT token for authenticated session
 * @throws {Error} When credentials are invalid (status: 401)
 */
export const loginUser = async (user, password) => {
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  user.last_login_at = new Date();
  await user.save();

  const token = generateToken(user);
  return token;
};
