import request from "supertest";
import app from "../../app.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getTestUserToken } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import { authConfig } from "../../config/config.js";

describe("GET /messages", () => {
  const endpoint = "/messages";
  let token;
  let userId;
  let conversationId;

  beforeAll(async () => {
    token = await getTestUserToken();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    userId = decoded.userId;
    conversationId = new mongoose.Types.ObjectId().toString();
    await Conversation.create({
      _id: conversationId,
      userId,
      from: "any-number",
      userName: "Test User",
      agentPhoneNumberId: "any-agent",
    });
  });

  it("should fail when missing conversationId (400)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: errorMessages.invalid_query,
      description: {
        conversationId: expect.any(String),
      },
    });
  });

  it("should fail when conversation does not exist (404)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ conversationId: "nonexistent-id" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty(
      "error",
      errorMessages.conversation_not_found
    );
  });

  it("should return empty array when no messages (200)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ conversationId, limit: 5, offset: 0 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("messages");
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages).toHaveLength(0);
  });

  it("should return messages when they exist (200)", async () => {
    await Message.create([
      {
        _id: new mongoose.Types.ObjectId().toString(),
        conversationId,
        userId,
        from: "user-123",
        userName: "User A",
        text: "Hola",
        type: "text",
        direction: "user",
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        conversationId,
        userId,
        from: "agent-456",
        userName: "Agent B",
        text: "Hola, ¿en qué puedo ayudar?",
        type: "text",
        direction: "agent",
      },
    ]);
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ conversationId, limit: 10, offset: 0 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("messages");
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages).toHaveLength(2);
    expect(res.body.messages[0]).toMatchObject({
      conversationId,
      text: expect.any(String),
      direction: expect.stringMatching(/user|agent/),
    });
  });
});
