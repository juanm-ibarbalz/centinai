import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { getTestUserToken } from "../utils.js";
import Metric from "../../models/Metric.js";
import { authConfig } from "../../config/config.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("GET /metrics/all", () => {
  const endpoint = "/metrics/all";
  let token, userId;

  beforeAll(async () => {
    token = await getTestUserToken();
    userId = jwt.verify(token, authConfig.jwtSecret).userId;
  });

  afterEach(async () => {
    await Metric.deleteMany({ userId });
  });

  it("should fail when limit is invalid (400)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ limit: "-5" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_query);
    expect(res.body.description).toMatchObject({
      limit: "Limit must be an integer greater than or equal to 0",
    });
  });

  it("should return an empty array when no metrics (200)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({});
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it("should return all metrics for the user (200)", async () => {
    const doc1 = {
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv1",
      userId,
      userCellphone: "549111",
      agentData: { agentId: "111", modelLLM: "m1", agentName: "A1" },
      endTime: new Date(),
      durationSeconds: 10,
      tokenUsage: {
        promptTokens: 1,
        completionTokens: 2,
        totalTokens: 3,
        cost: 0.001,
      },
      successful: true,
      tags: ["tag1"],
      messageCount: { user: 1, agent: 1, total: 2 },
      metadata: {
        language: "es",
        channel: "whatsapp",
        sentimentTrend: "neutral",
      },
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    const doc2 = {
      ...doc1,
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv2",
      agentData: { agentId: "222", modelLLM: "m2", agentName: "A2" },
      endTime: new Date(),
    };
    await Metric.create([doc1, doc2]);

    await Metric.create({
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "convX",
      userId: new mongoose.Types.ObjectId().toString(),
      userCellphone: "549222",
      agentData: { agentId: "999", modelLLM: "mX", agentName: "AX" },
      endTime: new Date(),
      durationSeconds: 5,
      tokenUsage: {
        promptTokens: 1,
        completionTokens: 1,
        totalTokens: 2,
        cost: 0,
      },
      successful: false,
      tags: [],
      messageCount: { user: 1, agent: 1, total: 2 },
      metadata: { language: "en", channel: "web", sentimentTrend: "positive" },
    });

    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ limit: 5, offset: 0 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      _id: doc2._id,
      conversationId: doc2.conversationId,
      userId,
      agentData: { agentId: "222" },
    });
    expect(res.body[1]).toMatchObject({
      _id: doc1._id,
      conversationId: doc1.conversationId,
      userId,
      agentData: { agentId: "111" },
    });
  });
});
