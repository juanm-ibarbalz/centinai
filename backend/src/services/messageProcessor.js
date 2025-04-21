import Message from "../models/Message.js";
import { createOrUpdateConversation } from "./conversationProcessor.js";

export const saveIncomingMessage = async (body) => {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];
  const contact = change?.value?.contacts?.[0];

  // Filtrar mensajes vacíos o no tipo "text"
  if (!message || !message.text?.body || message.type !== "text") return;

  // Determinar dirección del mensaje
  const isUser = message.from === contact?.wa_id;
  const direction = isUser ? "user" : "agent";

  const conversationId = entry.id;
  const from = message.from;
  const userName = contact?.profile?.name || "Desconocido";

  // Crear o actualizar la conversación
  await createOrUpdateConversation(conversationId, from, userName);

  // Armar documento
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
