import Message from "../models/Message.js";

export const saveIncomingMessage = async (body) => {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];
  const contact = change?.value?.contacts?.[0];

  if (!message) return;

  // 1. Filtrar mensajes vacíos
  if (!message.text?.body) return;

  // 2. Filtrar todo lo que no sea tipo "text"
  if (message.type !== "text") return;

  // 3. Determinar dirección del mensaje
  const isUser = message.from === contact?.wa_id;
  const direction = isUser ? "user" : "agent";

  // 4. Armar documento
  const messageData = {
    messageId: message.id,
    conversationId: entry.id,
    timestamp: message.timestamp,
    from: message.from,
    userName: contact?.profile?.name || "Desconocido",
    text: message.text.body,
    type: message.type,
    direction,
    status: "active",
  };

  await Message.create(messageData);
};
