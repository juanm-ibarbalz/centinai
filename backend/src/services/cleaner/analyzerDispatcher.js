import fs from "fs";
import axios from "axios";

const analyzerUrl = process.env.ANALYZER_URL;
if (!analyzerUrl) {
  console.warn("dispatchToAnalyzer: falta ANALYZER_URL en .env");
}

/**
 * Ejecuta el análisis de un archivo JSON mediante un script Python.
 * @param {string} filePath - Ruta absoluta al archivo JSON a analizar
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
