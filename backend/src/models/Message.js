import { conversationConfig } from "../config/config.js";
import mongoose from "mongoose";

/**
 * Message model schema for storing individual messages within conversations.
 * Represents a single message exchange between a user and an AI agent,
 * including metadata about the message and its context.
 *
 * @typedef {Object} Message
 * @property {string} _id - Unique message identifier (custom string ID)
 * @property {string} conversationId - Reference to the Conversation this message belongs to
 * @property {Date} timestamp - Timestamp when the message was sent/received
 * @property {string} [from] - Phone number or identifier of the message sender
 * @property {string} [userName] - Display name of the message sender
 * @property {string} [text] - Text content of the message
 * @property {string} [type] - Type of message (e.g., 'text', 'image', 'document')
 * @property {'user'|'agent'} direction - Direction of the message (user to agent or agent to user)
 * @property {'active'|'deleted'} status - Current status of the message (default: 'active')
 * @property {string} userId - Reference to the User who owns this message (required)
 * @property {Date} createdAt - Timestamp when the message was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when the message was last updated (auto-generated)
 */
const messageSchema = new mongoose.Schema(
  {
    _id: { type: String },
    conversationId: { type: String },
    timestamp: Date,
    from: String,
    userName: String,
    text: String,
    type: String,
    direction: {
      type: String,
      enum: [
        conversationConfig.directionUser,
        conversationConfig.directionAgent,
      ],
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

messageSchema.index({ conversationId: 1, userId: 1, timestamp: 1 });

export default mongoose.model("Message", messageSchema);
