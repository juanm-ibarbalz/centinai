import request from "supertest";
import app from "../../app.js";
import { getTestUserToken } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import Agent from "../../models/Agent.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/config.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";

describe("DELETE /agents/:id", () => {
  const endpoint = "/agents";
  let token;
  let userId;
  let agentId;
  let otherAgentId;
  let conversationId;
  let messageId;

  beforeAll(async () => {
    token = await getTestUserToken();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    userId = decoded.userId;

    const createdAgent = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Agent DeleteMe",
        phoneNumberId: "phone-del-me",
        payloadFormat: "structured",
        authMode: "query",
        modelName: "gpt-3.5-turbo",
      });
    agentId = createdAgent.body.id;

    otherAgentId = new mongoose.Types.ObjectId().toString();
    await Agent.create({
      _id: otherAgentId,
      userId: new mongoose.Types.ObjectId().toString(),
      name: "Agent Other",
      phoneNumberId: "phone-other",
      payloadFormat: "structured",
      authMode: "query",
      secretToken: "dummy",
      modelName: "gpt-3.5-turbo",
    });

    conversationId = new mongoose.Types.ObjectId().toString();
    await Conversation.create({
      _id: conversationId,
      userId,
      agentPhoneNumberId: createdAgent.body.phoneNumberId,
      from: "user-123",
      userName: "Test User",
      status: "open",
    });

    messageId = new mongoose.Types.ObjectId().toString();
    await Message.create({
      _id: messageId,
      conversationId: conversationId,
      userId,
      from: "user-123",
      userName: "Test User",
      text: "Mensaje de prueba",
      type: "text",
      direction: "user",
    });
  });

  afterAll(async () => {
    await Agent.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
  });

  it("should delete an existing agent (204)", async () => {
    const res = await request(app)
      .delete(`${endpoint}/${agentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    await expect(Agent.findById(agentId)).resolves.toBeNull();
    await expect(Conversation.findById(conversationId)).resolves.toBeNull();
    await expect(Message.findById(messageId)).resolves.toBeNull();
  });

  it("should fail when agent does not exist (404)", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`${endpoint}/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should fail when agent belongs to another user (404)", async () => {
    const res = await request(app)
      .delete(`${endpoint}/${otherAgentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });
});
