export const parseIncomingMessage = (body) => {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];
  const contact = change?.value?.contacts?.[0];

  // Filtro
  if (!message || !message.text?.body || message.type !== "text") return null;

  const isUser = message.from === contact?.wa_id;
  const direction = isUser ? "user" : "agent";

  return {
    conversationId: entry.id,
    from: message.from,
    userName: contact?.profile?.name || "Desconocido",
    messageId: message.id,
    timestamp: message.timestamp,
    text: message.text.body,
    type: message.type,
    direction,
    status: "active",
  };
};
