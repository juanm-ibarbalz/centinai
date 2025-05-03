// Valida si un mensaje es de texto y tiene contenido
const isValidTextMessage = (msg) => msg?.type === "text" && !!msg.text?.body;

// Construye la estructura base del mensaje procesado
const buildBaseMessage = (
  { msg, direction, userName, recipient_id },
  agentId,
) => ({
  messageId: msg.id,
  from: msg.from,
  recipient_id, // undefined si es un user
  userName,
  timestamp: msg.timestamp,
  text: msg.text.body,
  direction,
  status: "active",
  agentId,
});

// Parser de mensajes del usuario (messages)
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

// Parser de mensajes del agente (message_echoes)
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

// Mapeo del campo → función parser
const parsersByField = {
  messages: parseMessage,
  message_echoes: parseMessageEcho,
};

// Función principal que determina qué parser usar
export const parseIncomingMessage = (body) => {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const { field, value } = change || {};

  if (!entry || !value || !field) return null;

  const parser = parsersByField[field];
  return parser ? parser(value) : null;
};
