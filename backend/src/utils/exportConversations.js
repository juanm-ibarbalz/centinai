import fs from "fs";
import path from "path";
import { generateBatchId } from "./idGenerator.js";
import { analyzerConfig } from "./../config/config.js";

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

    const filename = generateBatchId();
    const filePath = path.join(TMP_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(conversations, null, 2), "utf-8");

    console.log(`✅ Archivo exportado: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("❌ Error al exportar conversaciones a JSON:", error);
    return null;
  }
};
