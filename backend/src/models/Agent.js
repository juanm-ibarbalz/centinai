import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  phoneNumberId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
});

export default mongoose.model("Agent", agentSchema);
