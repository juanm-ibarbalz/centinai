import fs from "fs";
import path from "path";
import { generateBatchId } from "../../utils/idGenerator.js";
import { analyzerConfig } from "../../config/config.js";
import Message from "../../models/Message.js";

const TMP_DIR = path.join(process.cwd(), analyzerConfig.exportDir);

/**
 * Guarda un lote de conversaciones en un archivo JSON único.
 * @param {Array<Object>} conversations - Conversaciones completas
 * @returns {string|null} - Ruta absoluta al archivo creado, o null si falló
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
 * Arma los objetos { conversation, messages } listos para exportar.
 * @param {Array<Object>} conversations - Conversaciones ya obtenidas
 * @returns {Promise<Array<Object>>} - Array con objetos para exportar
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
