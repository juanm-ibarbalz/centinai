import mongoose from "mongoose";

/**
 * Token usage statistics for AI model interactions.
 * Tracks token consumption and associated costs for conversation analysis.
 *
 * @typedef {Object} TokenUsage
 * @property {number} [promptTokens] - Number of tokens used in prompts
 * @property {number} [completionTokens] - Number of tokens in AI responses
 * @property {number} [totalTokens] - Total tokens used in the conversation
 * @property {number} [cost] - Cost associated with token usage
 */
const TokenUsageSchema = new mongoose.Schema(
  {
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number,
    cost: Number,
  },
  { _id: false }
);

/**
 * Message count statistics for conversation analysis.
 * Tracks the number of messages exchanged between user and agent.
 *
 * @typedef {Object} MessageCount
 * @property {number} [user] - Number of messages sent by the user
 * @property {number} [agent] - Number of messages sent by the agent
 * @property {number} [total] - Total number of messages in the conversation
 */
const MessageCountSchema = new mongoose.Schema(
  {
    user: Number,
    agent: Number,
    total: Number,
  },
  { _id: false }
);

/**
 * Additional metadata for conversation analysis.
 * Contains contextual information about the conversation.
 *
 * @typedef {Object} Metadata
 * @property {string} [language] - Primary language detected in the conversation
 * @property {string} [channel] - Communication channel used (e.g., 'whatsapp')
 * @property {string} [sentimentTrend] - Overall sentiment trend of the conversation
 */
const MetadataSchema = new mongoose.Schema(
  {
    language: String,
    channel: String,
    sentimentTrend: String,
  },
  { _id: false }
);

/**
 * Agent information for metrics tracking.
 * Contains details about the AI agent involved in the conversation.
 *
 * @typedef {Object} AgentData
 * @property {string} [agentId] - Unique identifier of the agent
 * @property {string} [modelLLM] - AI model used by the agent
 * @property {string} [agentName] - Display name of the agent
 */
const AgentDataSchema = new mongoose.Schema(
  {
    agentId: String,
    modelLLM: String,
    agentName: String,
  },
  { _id: false }
);

/**
 * Metric model schema for conversation analytics and performance tracking.
 * Stores comprehensive metrics about conversations including token usage,
 * message counts, duration, and analysis results from the AI system.
 *
 * @typedef {Object} Metric
 * @property {string} _id - Unique metric identifier (custom string ID)
 * @property {string} conversationId - Reference to the Conversation being analyzed (required)
 * @property {string} userId - Reference to the User who owns this metric (required)
 * @property {string} userCellphone - Phone number of the user in the conversation (required)
 * @property {AgentData} [agentData] - Information about the AI agent involved
 * @property {Date} [createdAt] - Timestamp when the conversation started
 * @property {Date} [endTime] - Timestamp when the conversation ended
 * @property {number} [durationSeconds] - Duration of the conversation in seconds
 * @property {TokenUsage} [tokenUsage] - Token consumption and cost statistics
 * @property {boolean} [successful] - Whether the conversation was successful
 * @property {string[]} [tags] - Array of tags for categorizing the conversation
 * @property {MessageCount} [messageCount] - Message count statistics
 * @property {Metadata} [metadata] - Additional conversation metadata
 * @property {Date} createdAt - Timestamp when the metric was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when the metric was last updated (auto-generated)
 */
const MetricSchema = new mongoose.Schema(
  {
    _id: { type: String },
    conversationId: { type: String, required: true },
    userId: { type: String, required: true },
    userCellphone: { type: String, required: true },
    agentData: AgentDataSchema,
    createdAt: Date,
    endTime: Date,
    durationSeconds: Number,
    tokenUsage: TokenUsageSchema,
    successful: Boolean,
    tags: [String],
    messageCount: MessageCountSchema,
    metadata: MetadataSchema,
  },
  {
    timestamps: true,
  }
);

MetricSchema.index({ userId: 1, "agentData.agentId": 1 });
MetricSchema.index({ conversationId: 1, userId: 1 });

export default mongoose.model("Metric", MetricSchema);
