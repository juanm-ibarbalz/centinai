import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true, // Esto ya crea un índice único automáticamente
    },
    from: String,
    userName: String,
    agentId: String,
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ❌ Eliminamos este índice duplicado
// conversationSchema.index({ conversationId: 1 });

conversationSchema.index({ status: 1 });
conversationSchema.index({ from: 1, agentId: 1, status: 1 });
conversationSchema.index({ userId: 1 });

export default mongoose.model("Conversation", conversationSchema);
