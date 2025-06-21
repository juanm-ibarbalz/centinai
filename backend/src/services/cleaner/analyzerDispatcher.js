import fs from "fs";
import axios from "axios";

const analyzerUrl = process.env.ANALYZER_URL;
if (!analyzerUrl) {
  console.warn("dispatchToAnalyzer: ANALYZER_URL missing in .env");
}

/**
 * Executes analysis of a JSON file by sending it to the Python analyzer service.
 * Reads the JSON file and sends it via HTTP POST to the analyzer endpoint
 * for conversation analysis and metrics generation.
 *
 * @param {string} filePath - Absolute path to the JSON file to be analyzed
 * @returns {Promise<void>} Resolves when analysis is successfully dispatched
 * @throws {Error} When file reading fails, network error occurs, or analyzer returns error
 */
export const dispatchToAnalyzer = async (filePath) => {
  if (!filePath) {
    console.warn("dispatchToAnalyzer: no se recibió filePath");
    return;
  }

  try {
    const payload = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const response = await axios.post(`${analyzerUrl}/analyze`, payload, {
      timeout: 120000,
    });

    console.log(`Resultado del analyzer para ${filePath}:`, response.data);
  } catch (err) {
    console.error("Error en dispatchToAnalyzer:", err.message || err);
    throw err;
  }
};
