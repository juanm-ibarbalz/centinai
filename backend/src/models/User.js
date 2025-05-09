import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  last_login_at: { type: Date },
  name: { type: String },
});

export default mongoose.model("User", userSchema);
