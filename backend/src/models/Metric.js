import mongoose from "mongoose";

const TokenUsageSchema = new mongoose.Schema(
  {
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number,
    cost: Number,
  },
  { _id: false }
);

const MessageCountSchema = new mongoose.Schema(
  {
    user: Number,
    agent: Number,
    total: Number,
  },
  { _id: false }
);

const MetadataSchema = new mongoose.Schema(
  {
    language: String,
    channel: String,
    sentimentTrend: String,
  },
  { _id: false }
);

const AgentDataSchema = new mongoose.Schema(
  {
    agentId: String,
    modelLLM: String,
    agentName: String,
  },
  { _id: false }
);

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
