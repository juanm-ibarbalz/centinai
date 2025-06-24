import fs from "fs";
import path from "path";
import { generateBatchId } from "../../utils/idGenerator.js";
import { analyzerConfig } from "../../config/config.js";
import Message from "../../models/Message.js";

const TMP_DIR = path.join(process.cwd(), analyzerConfig.exportDir);

/**
 * Saves a batch of conversations to a single JSON file.
 * Creates the export directory if it doesn't exist and generates a unique filename.
 *
 * @param {Array<Object>} conversations - Complete conversation objects with messages
 * @returns {string|null} Absolute path to the created file, or null if operation failed
 */
export const exportConversationsToJson = (conversations) => {
  try {
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    const filePath = path.join(TMP_DIR, generateBatchId());
    fs.writeFileSync(filePath, JSON.stringify(conversations, null, 2), "utf-8");

    console.log(`Archivo exportado: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error al exportar conversaciones a JSON:", error);
    return null;
  }
};

/**
 * Builds export payloads containing conversation and associated messages.
 * Retrieves all messages for each conversation and structures them for analysis.
 *
 * @param {Array<Object>} conversations - Conversation objects already retrieved from database
 * @returns {Promise<Array<Object>>} Array of objects with conversation and messages for export
 */
export const buildExportPayloads = async (conversations) => {
  const payloads = [];

  for (const conv of conversations) {
    const messages = await Message.find({ conversationId: conv._id })
      .sort({ timestamp: 1 })
      .lean();

    payloads.push({ conversation: conv, messages });
  }

  return payloads;
};
