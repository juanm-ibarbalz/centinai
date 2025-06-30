import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import Agent from "../../models/Agent.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("POST /webhook — Structured Format", () => {
  const endpoint = "/webhook";
  let agent;

  beforeAll(async () => {
    agent = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      modelName: "WebhookModel",
      name: "Structured Agent",
      phoneNumberId: "agent-phone-structured",
      payloadFormat: "structured",
      authMode: "body",
      fieldMapping: {},
      secretToken: "secret-structured",
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
      from: "user-111",
      timestamp: Date.now(),
      userName: "User One",
      text: "Hello structured!",
    };

    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const conv = await Conversation.findOne({
      agentPhoneNumberId: agent.phoneNumberId,
      from: payload.from,
    });
    expect(conv).not.toBeNull();

    const msg = await Message.findOne({
      conversationId: conv._id,
      userId: agent.userId,
    }).lean();
    expect(msg).not.toBeNull();
    expect(msg).toMatchObject({
      from: payload.from,
      direction: "user",
      text: payload.text,
    });
  });

  it("should process an agent echo (200)", async () => {
    const conversation = await Conversation.findOne({
      agentPhoneNumberId: agent.phoneNumberId,
      from: "user-111",
      status: "open",
    }).lean();

    const payload = {
      agentSecret: agent.secretToken,
      from: agent.phoneNumberId,
      to: conversation.from,
      timestamp: Date.now(),
      text: "Echo reply",
    };

    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const agentMsg = await Message.findOne({
      conversationId: conversation._id,
      direction: "agent",
    }).lean();
    expect(agentMsg).not.toBeNull();
    expect(agentMsg.text).toBe("Echo reply");
  });

  it("should fail if missing text (400)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      from: "user-222",
      timestamp: Date.now(),
      userName: "NoText",
      // text falta
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessages.invalid_mapping_or_payload);
  });

  it("should fail if missing timestamp (400)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      from: "user-333",
      userName: "NoTimestamp",
      text: "Hi!",
      // timestamp falta
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessages.invalid_mapping_or_payload);
  });

  it("should fail if no from or to provided (400)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      timestamp: Date.now(),
      text: "Nada de from/to",
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessages.invalid_mapping_or_payload);
  });

  it("should fail if sending custom-style payload (400)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      message: {
        sender: "user-444",
        time: Date.now(),
        payload: "Wrong format",
      },
    };
    const res = await request(app).post(endpoint).send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessages.invalid_mapping_or_payload);
  });
});
