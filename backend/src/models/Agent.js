import mongoose from "mongoose";
import crypto from "crypto";

const agentSchema = new mongoose.Schema({
  _id: { type: String },
  phoneNumberId: { type: String, required: true, unique: true },
  userId: { type: String, ref: "User", required: true },
  fieldMapping: { type: Object, default: {} },
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  secretToken: {
    type: String,
    required: true,
    default: () => crypto.randomUUID(),
    unique: true,
  },
  integrationMode: {
    type: String,
    enum: ["structured", "custom-mapped", "query-only"],
    required: true,
  },
});

export default mongoose.model("Agent", agentSchema);
