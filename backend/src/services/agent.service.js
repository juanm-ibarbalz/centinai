import Agent from "../models/Agent.js";
import { generateAgentId } from "../utils/idGenerator.js";

export const createAgent = async ({
  userId,
  phoneNumberId,
  name,
  description,
}) => {
  const existing = await Agent.findOne({ phoneNumberId });
  if (existing) throw new Error("Este agente ya está registrado");

  const agentId = generateAgentId(userId);

  const agent = new Agent({
    _id: agentId,
    userId,
    phoneNumberId,
    name,
    description,
    createdAt: new Date(),
  });

  await agent.save();
  return agent;
};
