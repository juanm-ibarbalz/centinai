/**
 * Centralized error messages for the CentinAI backend API.
 * Provides consistent error messages across all endpoints and services.
 *
 * @type {Object.<string, string>}
 */
export const errorMessages = {
  agent_already_exists: "Agent already exists",
  agent_not_found: "Agent not found",
  max_agents_reached: "Maximum number of agents per user reached",
  conversation_not_found: "Conversation not found",
  unauthorized_access: "You don't have permission to access this resource",
  missing_token: "Authorization token required",
  invalid_token: "Invalid or expired token",
  missing_agent_id: "The agentPhoneNumberId parameter is required",
  invalid_payload: "Invalid data sent",
  generic_error: "An unexpected error occurred",
  server_error: "A server error occurred",
  invalid_query: "Invalid query parameters",
  invalid_credentials: "Invalid credentials",
  user_not_found: "User not found",
  metric_not_found: "Metric not found",
  invalid_webhook_auth: "Invalid webhook authentication",
  invalid_mapping_or_payload: "Invalid mapping or payload",
};
