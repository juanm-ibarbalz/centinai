import mongoose from "mongoose";

/**
 * User model schema for authentication and user management.
 * Represents a user account in the CentinAI system with authentication
 * and profile information.
 *
 * @typedef {Object} User
 * @property {string} _id - Unique user identifier (custom string ID)
 * @property {string} email - User's email address (unique, required)
 * @property {string} password - Hashed password for authentication (required)
 * @property {Date} created_at - Timestamp when the user account was created
 * @property {Date} [last_login_at] - Timestamp of the user's last login (optional)
 * @property {string} [name] - User's full name (optional)
 */
const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    last_login_at: { type: Date },
    name: { type: String },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("User", userSchema);
