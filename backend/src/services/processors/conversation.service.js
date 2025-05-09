import Conversation from "../../models/Conversation.js";
import { conversationConfig } from "../../config/config.js";
import { generateConversationId } from "../../utils/idGenerator.js";

const TIMEOUT = conversationConfig.timeoutMs;

export const createOrUpdateConversation = async (
  userId,
  agentPhoneNumberId,
  userName,
  from,
) => {
  const now = new Date();
  const conversation = await findOpenConversation(from, agentPhoneNumberId);

  if (shouldCloseConversation(conversation, now)) {
    if (conversation) await closeConversation(conversation);
    return await createNewConversation(
      userId,
      agentPhoneNumberId,
      userName,
      from,
    );
  }

  await updateTimestamp(conversation);
  return conversation._id;
};

const findOpenConversation = async (from, agentPhoneNumberId) => {
  return Conversation.findOne({
    from,
    agentPhoneNumberId,
    status: "open",
  }).sort({ updatedAt: -1 });
};

const shouldCloseConversation = (conversation, now) => {
  if (!conversation) return true;
  return now - conversation.updatedAt > TIMEOUT;
};

const closeConversation = async (conversation) => {
  conversation.status = "closed";
  conversation.endTime = new Date();
  await conversation.save();
};

const updateTimestamp = async (conversation) => {
  conversation.lastUpdated = new Date();
  await conversation.save();
};

const createNewConversation = async (
  userId,
  agentPhoneNumberId,
  userName,
  from,
) => {
  const conversationId = generateConversationId(from, agentPhoneNumberId);

  const newConversation = new Conversation({
    _id: conversationId,
    from,
    userId,
    userName,
    agentPhoneNumberId,
    status: "open",
    startTime: new Date(),
    lastUpdated: new Date(),
  });

  await newConversation.save();
  return newConversation._id;
};
