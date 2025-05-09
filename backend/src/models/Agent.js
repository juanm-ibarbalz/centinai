import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  _id: { type: String },
  phoneNumberId: { type: String, required: true, unique: true },
  userId: { type: String, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Agent", agentSchema);
