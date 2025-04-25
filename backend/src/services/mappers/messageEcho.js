export const parseMessageEcho = (entry, value) => {
  const msg = value?.message_echoes?.[0];

  if (!msg || msg.type !== "text" || !msg.text?.body) return null;

  return {
    from: msg.from, // agente
    recipient_id: msg.recipient_id, // usuario
    userName: "Agente",
    messageId: msg.id,
    timestamp: msg.timestamp,
    text: msg.text.body,
    direction: "agent",
    status: "active",
    agentId: value?.metadata?.phone_number_id,
  };
};
