import jwt from "jsonwebtoken";
import { authConfig } from "../config/config.js";
import { sendError } from "../utils/responseUtils.js";

/**
 * Middleware that authenticates users using JWT tokens.
 * Extracts the Bearer token from the Authorization header, verifies it,
 * and adds the decoded user data to req.user for use in subsequent middleware/routes.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header with Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function to continue to next middleware
 * @returns {void} Calls next() if authentication succeeds, or sends error response
 * @throws {401} When Authorization header is missing or doesn't start with "Bearer "
 * @throws {403} When JWT token is invalid, expired, or cannot be verified
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "missing_token");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return sendError(res, 403, "invalid_token");
  }
};
