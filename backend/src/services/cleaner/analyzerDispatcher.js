import axios from "axios";

const analyzerUrl = process.env.ANALYZER_URL;
if (!analyzerUrl) {
  console.warn("dispatchToAnalyzer: ANALYZER_URL missing in .env");
}

/**
 * Envía el payload de conversaciones directamente al analyzer vía HTTP POST.
 *
 * @param {Array<Object>} payload - Conversaciones y mensajes para analizar
 * @returns {Promise<void>} Resolves when analysis is successfully dispatched
 * @throws {Error} When there is no payload, or analyzer returns error
 */
export const dispatchToAnalyzer = async (payload) => {
  if (!payload) {
    throw new Error("dispatchToAnalyzer: no se recibió payload");
  }

  await axios.post(`${analyzerUrl}/analyze`, payload, { timeout: 120000 });
};
