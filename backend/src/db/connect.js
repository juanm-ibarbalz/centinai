import mongoose from "mongoose";

/**
 * Conecta Mongoose a la URI indicada.
 * Si no se pasa `uri`, usa process.env.MONGO_URI.
 *
 * @param {string} [uri] – URI de Mongo a la que conectar
 */
const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB conected`);
  } catch (error) {
    console.error("Error connecting with MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
