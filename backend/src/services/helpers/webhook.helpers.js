import get from "lodash.get";
import Agent from "../../models/Agent.js";

/**
 * Extrae el agente a partir del request, usando siempre un secretToken (query, header o body)
 * @param {Request} req
 * @returns {Promise<Agent|null>}
 */
export const identifyAgent = async (req) => {
  const payload = req.body;

  const secret =
    req.query.secret || req.headers["x-agent-secret"] || payload?.agentSecret;

  if (!secret) return null;

  return await Agent.findOne({ secretToken: secret });
};

/**
 * Aplica el mapping del agente al payload entrante y valida los campos esenciales.
 * Si el modo de integración es 'structured', aplica un mapping por defecto.
 * @param {Object} payload
 * @param {Object} mapping
 * @param {string} mode - integrationMode
 * @returns {Object|null}
 */
export const applyMapping = (
  payload,
  mapping,
  mode,
  agentPhoneNumberId = null,
) => {
  if (!["structured", "custom-mapped", "query-only"].includes(mode))
    return null;

  const finalMapping =
    mode === "structured"
      ? {
          text: "message.text",
          from: "message.from",
          timestamp: "message.timestamp",
          userName: "message.userName",
          direction: "message.direction",
          recipient_id: "message.recipient_id",
        }
      : mapping;

  const text = get(payload, finalMapping.text);
  const from = get(payload, finalMapping.from);
  const timestamp = get(payload, finalMapping.timestamp);
  const userName = get(payload, finalMapping.userName) || "Desconocido";
  const directionRaw = get(payload, finalMapping.direction);
  const recipient_id = get(payload, finalMapping.recipient_id);

  // VALIDACIÓN mínima
  if (!text || !from || !timestamp) return null;

  // Si no hay direction, lo inferís
  let direction = directionRaw;
  if (!direction && agentPhoneNumberId) {
    direction = from === agentPhoneNumberId ? "agent" : "user";
  }

  return {
    from,
    recipient_id,
    userName,
    timestamp,
    text,
    direction: direction || "user",
    status: "active",
  };
};
