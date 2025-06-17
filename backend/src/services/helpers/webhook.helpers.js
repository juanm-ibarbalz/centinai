import get from "lodash.get";

const STRUCTURED_MAPPING = {
  text: "text",
  from: "from",
  to: "to",
  timestamp: "timestamp",
  userName: "userName",
};

/**
 * Aplica el mapeo del agente al payload entrante.
 * Si el formato es structured, usa el mapping por defecto.
 * Si es custom, usa el fieldMapping del agente.
 * @param {Object} payload - El body recibido
 * @param {Object} mapping - El fieldMapping del agente (si aplica)
 * @param {string} format - payloadFormat ("structured" | "custom")
 * @param {string} agentPhoneNumberId - ID del número de teléfono del agente
 * @returns {Object|null} - Mensaje parseado o null si es inválido
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
 * Mapea los participantes (from, to) y determina la dirección del mensaje.
 * Devuelve un objeto con los campos from, to y direction ("agent" o "user"),
 * o null si los datos no son válidos o no se puede determinar la dirección.
 *
 * @param {string} rawFrom - Valor crudo del campo "from" extraído del payload.
 * @param {string} rawTo - Valor crudo del campo "to" extraído del payload.
 * @param {string} agentPhone - Número de teléfono del agente.
 * @returns {{from: string, to: string, direction: "agent"|"user"} | null} Objeto con participantes y dirección, o null si inválido.
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
/
| from        | to          |
| ----------- | ----------- |
| agentNumber | agentNumber |  null
| agentNumber | userNumber  |  direction = "agent"
| agentNumber | no          |  null      
| userNumber  | agentNumber |  direction = "user"
| userNumber  | userNumber  |  null       
| userNumber  | no          |  direction = "user"     
| no          | agentNumber |  null
| no          | userNumber  |  direction = "agent"
| no          | no          |  null
*/
