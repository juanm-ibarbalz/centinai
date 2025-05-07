import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // 👈 este campo es obligatorio si vas a usar generateUserId()
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  last_login_at: { type: Date },
  name: { type: String },
});

export default mongoose.model("User", userSchema);
