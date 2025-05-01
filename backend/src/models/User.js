import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // guardá el hash
  created_at: { type: Date, default: Date.now },
  last_login_at: { type: Date },
});

export default mongoose.model("User", userSchema);
