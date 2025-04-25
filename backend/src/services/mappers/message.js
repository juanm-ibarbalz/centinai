export const parseMessage = (entry, value) => {
  const msg = value?.messages?.[0];
  const contact = value?.contacts?.[0];

  if (!msg || msg.type !== "text" || !msg.text?.body) return null;

  return {
    from: msg.from,
    userName: contact?.profile?.name || "Desconocido",
    messageId: msg.id,
    timestamp: msg.timestamp,
    text: msg.text.body,
    direction: "user",
    status: "active",
    agentId: value?.metadata?.phone_number_id,
  };
};
