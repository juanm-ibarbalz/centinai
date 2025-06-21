import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { createOrUpdateConversation } from "./conversation.service.js";
import { buildMessage } from "./helpers/message.helpers.js";

/**
 * Processes and saves an incoming message from webhook.
 * Routes the message to appropriate handler based on direction (user or agent).
 *
 * @param {Object} parsed - Parsed message object adapted from webhook data
 * @param {string} parsed.direction - Message direction ('user' or 'agent')
 * @param {string} parsed.agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {string} parsed.from - Phone number of the message sender
 * @param {string} parsed.to - Phone number of the message recipient
 * @param {string} parsed.userName - Display name of the user
 * @param {string} parsed.userId - ID of the user who owns the conversation
 * @returns {Promise<void>} Resolves when message is successfully processed and saved
 * @throws {Error} When agent message has no active conversation (status: 400)
 */
export const saveIncomingMessage = async (parsed) => {
  if (parsed.direction === "agent") {
    await processAgentMessage(parsed);
  } else {
    await processUserMessage(parsed);
  }
};

/**
 * Processes a message sent by an agent (message_echo).
 * Only saves the message if there's an active conversation for the recipient.
 *
 * @param {Object} parsed - Parsed message object with agent message data
 * @param {string} parsed.agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {string} parsed.to - Phone number of the message recipient
 * @returns {Promise<void>} Resolves when agent message is saved
 * @throws {Error} When there's no active conversation for the agent message (status: 400)
 */
const processAgentMessage = async (parsed) => {
  const existingConversation = await Conversation.findOne({
    agentPhoneNumberId: parsed.agentPhoneNumberId,
    from: parsed.to,
    status: "open",
  });

  if (!existingConversation) {
    const err = new Error(
      "Agent message without an active conversation. Ignored."
    );
    err.status = 400;
    throw err;
  }

  const messageDoc = buildMessage(parsed, existingConversation._id);
  await messageDoc.save();
};

/**
 * Processes an incoming message from an external user.
 * Creates or updates a conversation and saves the user message.
 *
 * @param {Object} parsed - Parsed message object with user message data
 * @param {string} parsed.userId - ID of the user who owns the conversation
 * @param {string} parsed.agentPhoneNumberId - WhatsApp phone number identifier of the agent
 * @param {string} parsed.userName - Display name of the user
 * @param {string} parsed.from - Phone number of the message sender
 * @returns {Promise<void>} Resolves when user message is processed and saved
 */
const processUserMessage = async (parsed) => {
  const conversationId = await createOrUpdateConversation(
    parsed.userId,
    parsed.agentPhoneNumberId,
    parsed.userName,
    parsed.from
  );

  const messageDoc = buildMessage(parsed, conversationId);
  await messageDoc.save();
};

/**
 * Retrieves messages for a conversation belonging to the authenticated user.
 * Includes pagination support and validates conversation ownership.
 *
 * @param {string} conversationId - ID of the conversation to retrieve messages from
 * @param {string} userId - ID of the user requesting the messages (for ownership validation)
 * @param {number} limit - Maximum number of messages to return
 * @param {number} offset - Number of messages to skip for pagination
 * @returns {Promise<Array>} Array of message objects sorted by timestamp
 * @throws {Error} When conversation doesn't exist or doesn't belong to the user
 */
export const getMessagesByConversationId = async (
  conversationId,
  userId,
  limit,
  offset
) => {
  return await Message.find({ conversationId, userId })
    .sort({ timestamp: 1 })
    .skip(offset)
    .limit(limit);
};
