import get from "lodash.get";

/**
 * Aplica el mapeo del agente al payload entrante.
 * Si el formato es structured, usa el mapping por defecto.
 * Si es custom, usa el fieldMapping del agente.
 * @param {Object} payload - El body recibido
 * @param {Object} mapping - El fieldMapping del agente (si aplica)
 * @param {string} format - payloadFormat ("structured" | "custom")
 * @returns {Object|null} - Mensaje parseado o null si es inválido
 */
export const applyMapping = (payload, mapping, format) => {
  if (!["structured", "custom"].includes(format)) return null;

  const finalMapping =
    format === "structured"
      ? {
          text: "text",
          from: "from",
          to: "to",
          timestamp: "timestamp",
          userName: "userName",
        }
      : mapping;

  const text = get(payload, finalMapping.text);
  const from = get(payload, finalMapping.from);
  const to = get(payload, finalMapping.to);
  const timestamp = get(payload, finalMapping.timestamp);
  const userName = get(payload, finalMapping.userName) || "Desconocido";

  if (!text || (!from && !to) || !timestamp) return null;

  let direction = "user";
  if (to) direction = "agent";

  return {
    from,
    to,
    userName,
    timestamp,
    text,
    direction: direction || "user",
    status: "open",
  };
};
