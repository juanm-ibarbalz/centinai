export const parseMessageEcho = (entry, value) => {
  const msg = value?.message_echoes?.[0];

  if (!msg || msg.type !== "text" || !msg.text?.body) return null;

  return {
    conversationId: entry.id,
    from: msg.from,
    userName: "Agente",
    messageId: msg.id,
    timestamp: msg.timestamp,
    text: msg.text.body,
    direction: "agent",
    status: "active",
  };
};
