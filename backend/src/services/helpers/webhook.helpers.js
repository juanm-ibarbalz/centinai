import get from "lodash.get";

const STRUCTURED_MAPPING = {
  text: "text",
  from: "from",
  to: "to",
  timestamp: "timestamp",
  userName: "userName",
};

/**
 * Applies agent mapping to incoming webhook payload.
 * Uses default structured mapping for "structured" format or custom field mapping
 * for "custom" format to extract message data from various webhook payload structures.
 *
 * @param {Object} payload - Raw webhook request body
 * @param {Object} mapping - Agent's field mapping configuration (for custom format)
 * @param {'structured'|'custom'} format - Payload format type
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @returns {Object|null} Parsed message object or null if payload is invalid
 */
export const applyMapping = (payload, mapping, format, agentPhoneNumberId) => {
  if (!["structured", "custom"].includes(format)) return null;

  const isStructured = format === "structured";
  const finalMapping = isStructured ? STRUCTURED_MAPPING : mapping;

  const text = get(payload, finalMapping.text);
  const rawFrom = get(payload, finalMapping.from);
  const rawTo = get(payload, finalMapping.to);
  const timestamp = get(payload, finalMapping.timestamp);
  const userName = get(payload, finalMapping.userName) || "Usuario";

  if (!text || !timestamp) return null;

  const participants = mapParticipants(rawFrom, rawTo, agentPhoneNumberId);
  if (!participants) return null;

  const { from, to, direction } = participants;
  return {
    from,
    to,
    userName,
    timestamp,
    text,
    direction,
    status: "open",
    agentPhoneNumberId,
  };
};

/**
 * Maps participants (from, to) and determines message direction.
 * Analyzes the from/to fields to determine if the message is from user to agent
 * or from agent to user, handling various edge cases and invalid scenarios.
 *
 * @param {string} rawFrom - Raw "from" field value extracted from payload
 * @param {string} rawTo - Raw "to" field value extracted from payload
 * @param {string} agentPhone - Agent's phone number for comparison
 * @returns {Object|null} Object with from, to, and direction ("agent"|"user"), or null if invalid
 */
function mapParticipants(rawFrom, rawTo, agentPhone) {
  const hasFrom = !!rawFrom;
  const hasTo = !!rawTo;

  if (
    rawFrom === rawTo || // ambos son el agente o el usuario, o son undefined
    (hasFrom && rawFrom === agentPhone && !hasTo) || // solo from = agente
    (hasTo && rawTo === agentPhone && !hasFrom) // solo to = agente
  ) {
    return null;
  }

  if (rawFrom === agentPhone && hasTo) {
    return { from: agentPhone, to: rawTo, direction: "agent" };
  }

  if (rawTo === agentPhone && hasFrom) {
    return { from: rawFrom, to: agentPhone, direction: "user" };
  }

  if (hasFrom && !hasTo) {
    return { from: rawFrom, to: agentPhone, direction: "user" };
  }

  if (!hasFrom && hasTo) {
    return { from: agentPhone, to: rawTo, direction: "agent" };
  }

  // no se cumple ningún caso, se retorna null
  return null;
}

/* 
| Cases for applyMapping function
| 
| from        | to          | result
| ----------- | ----------- | -------
| agentNumber | agentNumber | null (invalid)
| agentNumber | userNumber  | direction = "agent"
| agentNumber | undefined   | null (invalid)
| userNumber  | agentNumber | direction = "user"
| userNumber  | userNumber  | null (invalid)
| userNumber  | undefined   | direction = "user"
| undefined   | agentNumber | null (invalid)
| undefined   | userNumber  | direction = "agent"
| undefined   | undefined   | null (invalid)
*/
