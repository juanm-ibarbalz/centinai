import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import Agent from "../../models/Agent.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("POST /webhook", () => {
  const endpoint = "/webhook";
  let agent;

  beforeAll(async () => {
    // Crear un agente con secret y payloadFormat estructurado (sin mapping)
    agent = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      modelName: "WebhookModel",
      name: "Webhook Agent",
      phoneNumberId: "agent-phone-1",
      payloadFormat: "structured",
      authMode: "body",
      fieldMapping: {},
      secretToken: "secret-123",
    });
  });

  afterAll(async () => {
    await Agent.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
  });

  it("should fail if no secret provided (400)", async () => {
    const res = await request(app).post(endpoint).send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      errorMessages.invalid_webhook_auth
    );
  });

  it("should fail for invalid secret (404)", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ agentSecret: "wrong-secret" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should process a user message and save conversation and message (200)", async () => {
    const payload = {
      agentSecret: agent.secretToken,
      from: "user-321",
      timestamp: Math.floor(Date.now() / 1000),
      userName: "Test User",
      direction: "user",
      type: "text", // Si funciona el test, no deberia mapearse
      text: "Hello, webhook!",
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
      direction: payload.direction,
      text: payload.text,
    });
  });

  it("should process an agent echo only if conversation is open (200)", async () => {
    const conversation = await Conversation.findOne({
      agentPhoneNumberId: agent.phoneNumberId,
      from: "user-321",
      status: "open",
    }).lean();
    const payload = {
      agentSecret: agent.secretToken,
      from: agent.phoneNumberId,
      to: conversation.from,
      timestamp: Math.floor(Date.now() / 1000),
      direction: "agent",
      type: "text",
      text: "Agent reply",
    };

    const res = await request(app).post(endpoint).send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const agentMsg = await Message.findOne({
      conversationId: conversation._id,
      direction: payload.direction,
    }).lean();

    expect(agentMsg).not.toBeNull();
    expect(agentMsg.text).toBe("Agent reply");
  });
});
