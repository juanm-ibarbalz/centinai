import { exec } from "child_process";
import { analyzerConfig } from "../../config/config.js";

/**
 * Ejecuta el análisis de un archivo JSON mediante un script Python.
 * @param {string} filePath - Ruta absoluta al archivo JSON a analizar
 */
export const dispatchToAnalyzer = (filePath) => {
  if (!filePath) {
    console.warn("⚠️ dispatchToAnalyzer: no se recibió filePath");
    return;
  }

  const command = analyzerConfig.getCommand(filePath);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error al ejecutar analyzer.py: ${error.message}`);
      return;
    }
    if (stderr) {
      console.warn(`⚠️ Stderr del analyzer: ${stderr}`);
    }
    console.log(`✅ Analyzer ejecutado para: ${filePath}`);
  });
};
