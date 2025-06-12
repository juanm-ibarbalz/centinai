import mongoose from "mongoose";

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
    versionKey: false,
  }
);

conversationSchema.index({ from: 1, agentPhoneNumberId: 1, status: 1 });
conversationSchema.index({ status: 1, updatedAt: 1 });
conversationSchema.index({ userId: 1, agentPhoneNumberId: 1 });
conversationSchema.index({ _id: 1, userId: 1 });
conversationSchema.index({ userId: 1, agentPhoneNumberId: 1, createdAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
