import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: String,
    timestamp: String,
    from: String,
    text: String,
    type: String,
    raw: Object,
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
