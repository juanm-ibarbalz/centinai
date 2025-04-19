import Message from "../models/Message.js";

export const saveIncomingMessage = async (body) => {
  const entry = body?.entry?.[0];
  const changes = entry?.changes?.[0]?.value?.messages?.[0];

  if (!changes) return;

  const messageData = {
    conversationId: entry.id,
    timestamp: changes.timestamp,
    from: changes.from,
    text: changes.text?.body,
    type: changes.type,
    raw: changes,
  };

  await Message.create(messageData);
};
