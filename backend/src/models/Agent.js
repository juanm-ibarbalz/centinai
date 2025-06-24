import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Agent model schema for AI agent configuration and management.
 * Represents an AI agent that can process incoming webhook messages
 * and manage conversations through WhatsApp integration.
 *
 * @typedef {Object} Agent
 * @property {string} _id - Unique agent identifier (custom string ID)
 * @property {string} phoneNumberId - WhatsApp phone number identifier (unique, required)
 * @property {string} userId - Reference to the User who owns this agent (required)
 * @property {string} name - Display name for the agent (required)
 * @property {string} [description] - Optional description of the agent's purpose
 * @property {Date} createdAt - Timestamp when the agent was created
 * @property {string} secretToken - Unique secret token for webhook authentication (auto-generated)
 * @property {'structured'|'custom'} payloadFormat - Format for incoming webhook payloads
 * @property {'query'|'header'|'body'} authMode - Authentication method for webhook requests
 * @property {Object} fieldMapping - Configuration for mapping incoming fields to system fields
 * @property {string} [modelName] - AI model name to be used by this agent
 */
const agentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    phoneNumberId: { type: String, required: true, unique: true },
    userId: { type: String, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    secretToken: {
      type: String,
      required: true,
      default: () => crypto.randomUUID(),
      unique: true,
    },
    payloadFormat: {
      type: String,
      enum: ["structured", "custom"],
      required: true,
    },
    authMode: {
      type: String,
      enum: ["query", "header", "body"],
      required: true,
    },
    fieldMapping: {
      type: Object,
      default: {},
    },
    modelName: { type: String },
  },
  {
    versionKey: false,
  }
);

agentSchema.index({ userId: 1, createdAt: 1 });
agentSchema.index({ phoneNumberId: 1, userId: 1 });

export default mongoose.model("Agent", agentSchema);
