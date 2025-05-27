import mongoose from "mongoose";
import crypto from "crypto";

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
  },
  {
    versionKey: false,
  },
);

agentSchema.index({ secretToken: 1, authMode: 1 });
agentSchema.index({ phoneNumberId: 1 });
agentSchema.index({ userId: 1 });
agentSchema.index({ _id: 1, userId: 1 }); // opcional

export default mongoose.model("Agent", agentSchema);
