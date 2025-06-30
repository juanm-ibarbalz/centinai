import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import Agent from "../../models/Agent.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("POST /webhook — Custom Format", () => {
  const endpoint = "/webhook";
  let agent;

  beforeAll(async () => {
    agent = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      modelName: "WebhookModel",
      name: "Custom Agent",
      phoneNumberId: "agent-phone-custom",
      payloadFormat: "custom",
      authMode: "body",
      fieldMapping: {
        text: "message.payload",
        from: "message.sender",
        timestamp: "message.time",
        to: "message.recipient",
      },
      secretToken: "secret-custom",
    });
  });

  afterAll(async () => {
    await Agent.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
  });

  it("should process a user message (200)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      message: {
        sender: "user-555",
        time: Date.now(),
        payload: "Hola custom!",
      },
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const conv = await Conversation.findOne({
      agentPhoneNumberId: agent.phoneNumberId,
      from: payload.message.sender,
    });
    expect(conv).not.toBeNull();

    const msg = await Message.findOne({
      conversationId: conv._id,
      userId: agent.userId,
    }).lean();
    expect(msg).not.toBeNull();
    expect(msg).toMatchObject({
      from: payload.message.sender,
      direction: "user",
      text: payload.message.payload,
    });
  });

  it("should process an agent echo (200)", async () => {
    const conversation = await Conversation.findOne({
      agentPhoneNumberId: agent.phoneNumberId,
      from: "user-555",
      status: "open",
    }).lean();

    const payload = {
      agentSecret: agent.secretToken,
      message: {
        sender: agent.phoneNumberId,
        recipient: conversation.from,
        time: Date.now(),
        payload: "Custom reply",
      },
    };

    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const agentMsg = await Message.findOne({
      conversationId: conversation._id,
      direction: "agent",
    }).lean();
    expect(agentMsg).not.toBeNull();
    expect(agentMsg).toMatchObject({
      from: agent.phoneNumberId,
      text: "Custom reply",
      direction: "agent",
    });
  });

  it("should fail if missing message.payload (400)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      message: {
        sender: "user-666",
        recipient: "anyone",
        time: Date.now(),
        // payload falta
      },
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessages.invalid_mapping_or_payload);
  });

  it("should fail if missing message.time (400)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      message: {
        sender: "user-777",
        recipient: "anyone",
        payload: "No time",
      },
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessages.invalid_mapping_or_payload);
  });

  it("should fail if sending structured-style payload (400)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      from: "user-888",
      timestamp: Date.now(),
      text: "Wrong shape",
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessages.invalid_mapping_or_payload);
  });
});
