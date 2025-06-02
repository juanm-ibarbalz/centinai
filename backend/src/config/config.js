// Centralized configuration for CentinAI backend
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

/**
 * Configuración general de la aplicación.
 */
export const appConfig = {
  isDev: process.env.NODE_ENV !== "production",
  logVerbose: true,
};

/**
 * Configuración de autenticación JWT.
 */
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
};

/**
 * Prefijos para IDs únicos generados por el sistema.
 */
export const idConfig = {
  userPrefix: "usr",
  agentPrefix: "agt",
  conversationPrefix: "conv",
  messagePrefix: "msg",
  sessionPrefix: "sess",
  batchPrefix: "batch",
};

/**
 * Configuración relacionada a la duración y limpieza de conversaciones.
 */
export const conversationConfig = {
  timeoutMs: 120 * 60 * 1000, // 2 horas de inactividad
  cleanupIntervalMinutes: 5,
  defaultConversationStatus: "open",
};

/**
 * Configuración de seguridad para limitar intentos de login.
 */
export const securityConfig = {
  loginRateLimit: {
    windowMinutes: 1,
    maxAttempts: 5,
    errorMessage: "Demasiados intentos. Intente nuevamente en un minuto.",
  },
};

/**
 * Configuración de límites del sistema.
 */
export const limitsConfig = {
  maxAgentsPerUser: 3,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../../");
const scriptPath = path.join(projectRoot, "analyzer", "initi_analyzer.py");
const pythonBin = process.env.PYTHON_BIN || "python3";

/**
 * Configuración relacionada al sistema de análisis.
 */
export const analyzerConfig = {
  exportDir: "tmp/analyzer_jobs",

  /**
   * Devuelve el comando shell para ejecutar el analizador con un archivo específico.
   * @param {string} filePath Ruta absoluta al archivo JSON a procesar.
   * @returns {string} Comando completo para ejecutar.
   */
  getCommand(filePath) {
    return `${pythonBin} "${scriptPath}" "${filePath}"`;
  },
};
