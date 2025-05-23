import get from "lodash.get";
import Agent from "../../models/Agent.js";

/**
 * Identifica al agente que envió la solicitud usando el token según authMode.
 * @param {import("express").Request} req
 * @returns {Promise<Agent|null>}
 */
export const identifyAgent = async (req) => {
  const fromQuery = req.query.secret;
  const fromHeader = req.headers["x-agent-secret"];
  const fromBody = req.body?.agentSecret;

  if (fromQuery) {
    const agent = await Agent.findOne({
      secretToken: fromQuery,
      authMode: "query",
    });
    if (agent) return agent;
  }

  if (fromHeader) {
    const agent = await Agent.findOne({
      secretToken: fromHeader,
      authMode: "header",
    });
    if (agent) return agent;
  }

  if (fromBody) {
    const agent = await Agent.findOne({
      secretToken: fromBody,
      authMode: "body",
    });
    if (agent) return agent;
  }

  return null;
};

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
          recipient_id: "message.recipient_id",
        }
      : mapping;

  const text = get(payload, finalMapping.text);
  const from = get(payload, finalMapping.from);
  const timestamp = get(payload, finalMapping.timestamp);
  const userName = get(payload, finalMapping.userName) || "Desconocido";
  const directionRaw = get(payload, finalMapping.direction);
  const recipient_id = get(payload, finalMapping.recipient_id);

  if (!text || !from || !timestamp) return null;

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
