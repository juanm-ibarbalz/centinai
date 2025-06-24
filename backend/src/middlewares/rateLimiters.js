import rateLimit from "express-rate-limit";
import { securityConfig } from "../config/config.js";

const { windowMinutes, maxAttempts, errorMessage } =
  securityConfig.loginRateLimit;

/**
 * Rate limiting middleware for the login endpoint.
 * Prevents brute force attacks by limiting the number of login attempts
 * within a specified time window. Uses express-rate-limit for implementation.
 *
 * Configuration:
 * - Time window: 2 minutes (from securityConfig)
 * - Max attempts: 10 (from securityConfig)
 * - Error message: Custom message from securityConfig
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
export const loginLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000, // Time window in milliseconds
  max: maxAttempts, // Maximum number of attempts allowed
  message: { error: errorMessage }, // Error message returned when limit is reached
  standardHeaders: true, // Use standard rate limit headers
  legacyHeaders: false, // Disable legacy headers
});
