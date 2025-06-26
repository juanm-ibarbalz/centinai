import { registerUser, loginUser } from "../../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../../validators/auth.validator.js";
import { sendError, sendSuccess } from "../../utils/responseUtils.js";
import User from "../../models/User.js";

/**
 * Controller for user registration.
 * Validates the request body using Zod schema, checks if user already exists,
 * and creates a new user in the database.
 *
 * @route POST /auth/register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user registration data
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {string} req.body.name - User's full name
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status and user data or error
 * @throws {400} When request body validation fails
 * @throws {409} When user with provided email already exists
 * @throws {500} When server error occurs during user creation
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
      message: "User created",
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
 * Controller for user authentication and login.
 * Validates login credentials using Zod schema, verifies user exists,
 * authenticates password, and returns JWT token for session management.
 *
 * @route POST /auth/login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with JWT token and user data or error
 * @throws {400} When request body validation fails
 * @throws {401} When invalid credentials are provided
 * @throws {500} When server error occurs during authentication
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
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    return sendError(res, err.status || 500, err.message || "server_error");
  }
};
