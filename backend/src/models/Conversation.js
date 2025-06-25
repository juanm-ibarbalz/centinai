import mongoose from "mongoose";

/**
 * Conversation model schema for managing chat sessions between users and AI agents.
 * Represents a conversation thread that contains multiple messages and tracks
 * the conversation state and metadata.
 *
 * @typedef {Object} Conversation
 * @property {string} _id - Unique conversation identifier (custom string ID)
 * @property {string} [from] - Phone number or identifier of the user starting the conversation
 * @property {string} [userName] - Display name of the user in the conversation
 * @property {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @property {string} userId - Reference to the User who owns this conversation (required)
 * @property {'open'|'closed'} status - Current status of the conversation (default: 'open')
 * @property {Date} createdAt - Timestamp when the conversation was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when the conversation was last updated (auto-generated)
 */
const conversationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    from: String,
    userName: String,
    agentPhoneNumberId: String,
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "open",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

conversationSchema.index({ from: 1, agentPhoneNumberId: 1, status: 1 });
conversationSchema.index({ status: 1, updatedAt: 1 });
conversationSchema.index({ userId: 1, agentPhoneNumberId: 1, createdAt: -1 });
conversationSchema.index({ agentPhoneNumberId: 1 });

export default mongoose.model("Conversation", conversationSchema);
