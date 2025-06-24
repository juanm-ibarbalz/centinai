import get from "lodash.get";

const STRUCTURED_MAPPING = {
  text: "text",
  from: "from",
  to: "to",
  timestamp: "timestamp",
  userName: "userName",
};

/**
 * Maps and normalizes an incoming webhook payload to the internal message format.
 * - Transforms field names according to agent mapping or default structure.
 * - Always normalizes the timestamp to a JavaScript Date object.
 * - Throws specific errors if required fields are missing or invalid.
 *
 * @param {Object} payload - Raw webhook request body.
 * @param {Object} mapping - Agent's field mapping configuration (for custom format).
 * @param {'structured'|'custom'} format - Payload format type.
 * @param {string} agentPhoneNumberId - WhatsApp phone number identifier of the agent.
 * @returns {Object} Parsed and normalized message object.
 * @throws {Error} If format is invalid, required fields are missing, or timestamp/participants are invalid.
 */
export const applyMapping = (payload, mapping, format, agentPhoneNumberId) => {
  if (!["structured", "custom"].includes(format)) {
    throw new Error("invalid_format");
  }

  const isStructured = format === "structured";
  const finalMapping = isStructured ? STRUCTURED_MAPPING : mapping;

  const text = get(payload, finalMapping.text);
  const rawFrom = get(payload, finalMapping.from);
  const rawTo = get(payload, finalMapping.to);
  const timestamp = get(payload, finalMapping.timestamp);
  const userName = get(payload, finalMapping.userName) || "Usuario";

  if (!text) throw new Error("missing_text");
  if (!timestamp) throw new Error("missing_timestamp");

  const normalizedTimestamp = normalizeTimestamp(timestamp);
  if (!normalizedTimestamp) throw new Error("invalid_timestamp");

  const participants = mapParticipants(rawFrom, rawTo, agentPhoneNumberId);
  if (!participants) throw new Error("invalid_message_fowarding");

  const { from, to, direction } = participants;
  return {
    from,
    to,
    userName,
    timestamp: normalizedTimestamp,
    text,
    direction,
    status: "open",
    agentPhoneNumberId,
  };
};

/**
 * Normalizes a timestamp value to a JavaScript Date object in UTC.
 * - If input is a number, only accepts milliseconds since epoch (>= 1e12).
 * - If input is a string, parses as UTC: if no timezone, assumes UTC.
 *
 * @param {number|string} timestamp - The timestamp to normalize (number in ms or ISO string).
 * @returns {Date|null} JavaScript Date object in UTC, or null if invalid.
 */
function normalizeTimestamp(timestamp) {
  if (typeof timestamp === "number") {
    if (timestamp < 1e12) return null;
    const date = new Date(timestamp);

    return isNaN(date.getTime()) ? null : date;
  } else if (typeof timestamp === "string") {
    const hasZone = /Z$|[+-]\d{2}:\d{2}$/.test(timestamp);
    const date = new Date(hasZone ? timestamp : timestamp + "Z");

    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Maps participants (from, to) and determines message direction.
 * Analyzes the from/to fields to determine if the message is from user to agent
 * or from agent to user, handling various edge cases and invalid scenarios.
 *
 * @param {string} rawFrom - Raw "from" field value extracted from payload.
 * @param {string} rawTo - Raw "to" field value extracted from payload.
 * @param {string} agentPhone - Agent's phone number for comparison.
 * @returns {Object|null} Object with from, to, and direction ("agent"|"user"), or null if invalid.
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
