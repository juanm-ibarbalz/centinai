/**
 * Valida si el mensaje recibido es de tipo texto y contiene contenido.
 * @param {Object} msg - Objeto mensaje desde la API de WhatsApp
 * @returns {boolean} - True si es un mensaje de texto válido
 */
const isValidTextMessage = (msg) => msg?.type === "text" && !!msg.text?.body;

/**
 * Construye la estructura base de un mensaje a guardar en base al objeto original.
 * @param {Object} options
 * @param {Object} options.msg - Mensaje original
 * @param {string} options.direction - "user" o "agent"
 * @param {string} options.userName - Nombre del usuario (o "Agente")
 * @param {string} [options.recipient_id] - Receptor del mensaje (solo para agent)
 * @param {string} agentPhoneNumberId - Número de teléfono del agente (usado como ID)
 * @returns {Object} - Objeto con formato listo para guardar
 */
const buildBaseMessage = (
  { msg, direction, userName, recipient_id },
  agentPhoneNumberId,
) => ({
  from: msg.from,
  recipient_id, // undefined si es un user
  userName,
  timestamp: msg.timestamp,
  text: msg.text.body,
  direction,
  status: "active",
  agentPhoneNumberId,
});

/**
 * Parsea un mensaje recibido desde un usuario externo (campo: messages).
 * @param {Object} value - Payload bajo campo "value"
 * @returns {Object|null} - Mensaje formateado o null si no es válido
 */
const parseMessage = (value) => {
  const msg = value?.messages?.[0];
  const contact = value?.contacts?.[0];
  if (!isValidTextMessage(msg)) return null;

  return buildBaseMessage(
    {
      msg,
      direction: "user",
      userName: contact?.profile?.name || "Desconocido",
    },
    value?.metadata?.phone_number_id,
  );
};

/**
 * Parsea un mensaje echo enviado por el agente (campo: message_echoes).
 * @param {Object} value - Payload bajo campo "value"
 * @returns {Object|null} - Mensaje formateado o null si no es válido
 */
const parseMessageEcho = (value) => {
  const msg = value?.message_echoes?.[0];
  if (!isValidTextMessage(msg)) return null;

  return buildBaseMessage(
    {
      msg,
      recipient_id: msg.recipient_id,
      direction: "agent",
      userName: "Agente",
    },
    value?.metadata?.phone_number_id,
  );
};

// Mapeo del tipo de evento a su parser correspondiente
const parsersByField = {
  messages: parseMessage,
  message_echoes: parseMessageEcho,
};

/**
 * Determina automáticamente qué parser utilizar según el campo entrante (messages o message_echoes).
 * @param {Object} body - Cuerpo completo del webhook de WhatsApp
 * @returns {Object|null} - Objeto mensaje procesado o null si no se pudo parsear
 */
export const parseIncomingMessage = (body) => {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const { field, value } = change || {};

  if (!entry || !value || !field) return null;

  const parser = parsersByField[field];
  return parser ? parser(value) : null;
};
