import Message from "../../models/Message.js";
import { generateMessageId } from "../../utils/idGenerator.js";

/**
 * Builds a Message document ready for database storage.
 * Assumes the timestamp is already a valid Date object.
 *
 * @param {Object} parsed - Parsed and normalized message object from webhook.
 * @param {string} parsed.from - Phone number or identifier of the message sender.
 * @param {Date} parsed.timestamp - JavaScript Date object representing the message timestamp.
 * @param {string} parsed.userName - Display name of the message sender.
 * @param {'user'|'agent'} parsed.direction - Direction of the message.
 * @param {string} parsed.type - Type of message.
 * @param {string} parsed.text - Text content of the message.
 * @param {string} parsed.userId - ID of the user who owns the conversation.
 * @param {string} conversationId - ID of the conversation this message belongs to.
 * @returns {Object} Message document instance ready for database save.
 * @throws {Error} When message ID generation fails (status: 500).
 */
export const buildMessage = (parsed, conversationId) => {
  const { from, timestamp, userName, direction, type, text, userId } = parsed;

  const generatedMessageId = generateMessageId(conversationId);
  if (generatedMessageId === null) {
    const err = new Error("Error generating message ID");
    err.status = 500;
    throw err;
  }

  return new Message({
    _id: generatedMessageId,
    from,
    timestamp,
    userName,
    direction,
    type,
    text,
    userId,
    conversationId,
  });
};
