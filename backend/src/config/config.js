// Centralized configuration for CentinAI backend
import dotenv from "dotenv";
dotenv.config();

/**
 * JWT authentication configuration.
 * Defines secret key and token expiration settings for user authentication.
 */
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
};

/**
 * Unique ID prefixes for system-generated identifiers.
 * Ensures consistent and recognizable ID formats across different entities.
 */
export const idConfig = {
  userPrefix: "usr",
  agentPrefix: "agt",
  conversationPrefix: "conv",
  messagePrefix: "msg",
  sessionPrefix: "sess",
  batchPrefix: "batch",
};

/**
 * Conversation management configuration.
 * Controls timeout settings, cleanup intervals, and default conversation states.
 */
export const conversationConfig = {
  timeoutMs: 30 * 60 * 1000, // 30 minute/s of inactivity before timeout
  cleanupIntervalMinutes: 3, // Cleanup job runs every 3 minutes
  defaultConversationStatus: "open",
  closingConversationStatus: "closed",
  defaultUserName: "User", // Default user name for conversations
  structuredMappingFields: {
    text: "text",
    from: "from",
    to: "to",
    timestamp: "timestamp",
    userName: "userName",
  },
  structuredMapping: "structured",
  customMapping: "custom",
  directionUser: "user",
  directionAgent: "agent",
};

/**
 * Security configuration for rate limiting and protection.
 * Prevents brute force attacks and abuse of authentication endpoints.
 */
export const securityConfig = {
  loginRateLimit: {
    windowMinutes: 2,
    maxAttempts: 10,
    errorMessage: "Too many login attempts. Please try again in a minute.",
  },
};

/**
 * System limits configuration.
 * Defines maximum allowed resources per user to prevent abuse.
 */
export const limitsConfig = {
  maxAgentsPerUser: 3,
};
