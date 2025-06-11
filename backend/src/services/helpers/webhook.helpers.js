import get from "lodash.get";

/**
 * Aplica el mapeo del agente al payload entrante.
 * Si el formato es structured, usa el mapping por defecto.
 * Si es custom, usa el fieldMapping del agente.
 * @param {Object} payload - El body recibido
 * @param {Object} mapping - El fieldMapping del agente (si aplica)
 * @param {string} format - payloadFormat ("structured" | "custom")
 * @param {string|null} agentPhoneNumberId - Para inferir direction si falta
 * @returns {Object|null} - Mensaje parseado o null si es inválido
 */
export const applyMapping = (
  payload,
  mapping,
  format,
  agentPhoneNumberId = null,
) => {
  if (!["structured", "custom"].includes(format)) return null;

  const finalMapping =
    format === "structured"
      ? {
          text: "message.text",
          from: "message.from",
          timestamp: "message.timestamp",
          userName: "message.userName",
          direction: "message.direction",
        }
      : mapping;

  const text = get(payload, finalMapping.text);
  const from = get(payload, finalMapping.from);
  const timestamp = get(payload, finalMapping.timestamp);
  const userName = get(payload, finalMapping.userName) || "Desconocido";
  const directionRaw = get(payload, finalMapping.direction);

  if (!text || !from || !timestamp) return null;

  let direction = directionRaw;
  if (!direction && agentPhoneNumberId) {
    direction = from === agentPhoneNumberId ? "agent" : "user";
  }

  return {
    from,
    userName,
    timestamp,
    text,
    direction: direction || "user",
    status: "active",
  };
};
