import dotenv from "dotenv";
import connectDB from "./db/connect.js";
import app from "./app.js";
import { startConversationCleanupJob } from "./services/cleaner/conversationCleaner.js";

dotenv.config();
startConversationCleanupJob();

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server on ${PORT}`));
});
