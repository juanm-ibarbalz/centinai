import Message from "../../models/Message.js";

/**
 * Builds export payloads containing the conversation(s) and their associated messages.
 * Accepts either a single conversation object or an array of conversations.
 *
 * @param {Object|Array<Object>} conversations - Conversation object or array of conversation objects
 * @returns {Promise<Array<Object>>} Array of objects with conversation and messages for export (in memory)
 */
export const buildExportPayloads = async (conversations) => {
  const convArray = Array.isArray(conversations)
    ? conversations
    : [conversations];
  const payloads = [];

  for (const conv of convArray) {
    const messages = await Message.find({ conversationId: conv._id })
      .sort({ timestamp: 1 })
      .lean();

    payloads.push({ conversation: conv, messages });
  }

  return payloads;
};
