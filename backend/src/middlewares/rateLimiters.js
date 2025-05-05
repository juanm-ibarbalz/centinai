import rateLimit from "express-rate-limit";
import { securityConfig } from "../config/config.js";

const { windowMinutes, maxAttempts, errorMessage } =
  securityConfig.loginRateLimit;

export const loginLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxAttempts,
  message: { error: errorMessage },
  standardHeaders: true,
  legacyHeaders: false,
});
