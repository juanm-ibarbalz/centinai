import { parseMessage } from "./mappers/message.js";
import { parseMessageEcho } from "./mappers/messageEcho.js";

const parsersByField = {
  messages: parseMessage,
  message_echoes: parseMessageEcho,
};

export const parseIncomingMessage = (body) => {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const field = change?.field;

  const parser = parsersByField[field];
  if (!entry || !value || !parser) return null;

  return parser(entry, value);
};
