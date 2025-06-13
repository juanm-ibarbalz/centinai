import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import Agent from "../../models/Agent.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("POST /webhook", () => {
  const endpoint = "/webhook";
  let agentBody;
  let agentHeader;
  let agentQuery;

  beforeAll(async () => {
    // body secret - structured
    agentBody = await Agent.create({
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

    // header secret - structured
    agentHeader = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      modelName: "WebhookModel",
      name: "Webhook Agent",
      phoneNumberId: "agent-phone-2",
      payloadFormat: "structured",
      authMode: "header",
      fieldMapping: {},
      secretToken: "secret-456",
    });

    // query secret - structured
    agentQuery = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      modelName: "WebhookModel",
      name: "Webhook Agent",
      phoneNumberId: "agent-phone-3",
      payloadFormat: "structured",
      authMode: "query",
      fieldMapping: {},
      secretToken: "secret-789",
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

  it("should fail for invalid body secret (404)", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ agentSecret: "wrong-secret" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should fail for invalid header secret (404)", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("x-agent-secret", "wrong-secret")
      .send({});

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should fail for invalid query secret (404)", async () => {
    const res = await request(app)
      .post(endpoint)
      .query({ secret: "wrong-secret" })
      .send({});

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should process message with a body secret (200)", async () => {
    const payload = {
      agentSecret: agentBody.secretToken, // <--- secret por body
      from: "user-321",
      timestamp: Math.floor(Date.now() / 1000),
      userName: "Test User",
      type: "text", // Si funciona el test, no deberia mapearse
      text: "Hello, webhook!",
    };

    const res = await request(app).post(endpoint).send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const conv = await Conversation.findOne({
      agentPhoneNumberId: agentBody.phoneNumberId,
      from: payload.from,
    });
    expect(conv).not.toBeNull();

    const msg = await Message.findOne({
      conversationId: conv._id,
      userId: agentBody.userId,
    }).lean();
    expect(msg).not.toBeNull();
    expect(msg).toMatchObject({
      from: payload.from,
      direction: "user",
      text: payload.text,
    });
  });

  it("should process message with a header secret (200)", async () => {
    const payload = {
      from: "user-321",
      timestamp: Math.floor(Date.now() / 1000),
      userName: "Test User",
      type: "text",
      text: "Hello, webhook!",
    };

    const res = await request(app)
      .post(endpoint)
      .set("x-agent-secret", agentHeader.secretToken) // <--- secret por header
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const conv = await Conversation.findOne({
      agentPhoneNumberId: agentHeader.phoneNumberId,
      from: payload.from,
    });
    expect(conv).not.toBeNull();

    const msg = await Message.findOne({
      conversationId: conv._id,
      userId: agentHeader.userId,
    }).lean();
    expect(msg).not.toBeNull();
    expect(msg).toMatchObject({
      from: payload.from,
      direction: "user",
      text: payload.text,
    });
  });

  it("should process message with a query secret (200)", async () => {
    const payload = {
      from: "user-321",
      timestamp: Math.floor(Date.now() / 1000),
      userName: "Test User",
      type: "text",
      text: "Hello, webhook!",
    };

    const res = await request(app)
      .post(endpoint)
      .query({ secret: agentQuery.secretToken }) // <--- secret por query
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "[WEBHOOK OK]" });

    const conv = await Conversation.findOne({
      agentPhoneNumberId: agentQuery.phoneNumberId,
      from: payload.from,
    });
    expect(conv).not.toBeNull();

    const msg = await Message.findOne({
      conversationId: conv._id,
      userId: agentQuery.userId,
    }).lean();
    expect(msg).not.toBeNull();
    expect(msg).toMatchObject({
      from: payload.from,
      direction: "user",
      text: payload.text,
    });
  });
});
