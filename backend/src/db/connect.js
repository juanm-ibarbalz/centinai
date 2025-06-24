import mongoose from "mongoose";

/**
 * Establishes a connection to MongoDB using Mongoose.
 * If no URI is provided, uses the MONGO_URI environment variable.
 * Exits the process if connection fails to prevent application startup with invalid database.
 *
 * @param {string} [uri] - MongoDB connection URI. If not provided, uses process.env.MONGO_URI
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} When connection fails, logs error and exits process
 */
const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
