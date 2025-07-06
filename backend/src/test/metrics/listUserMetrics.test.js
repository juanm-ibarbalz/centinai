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

  it("should fail when dateFrom is invalid (400)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ dateFrom: "invalid-date" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_query);
    expect(res.body.description).toMatchObject({
      dateFrom: "dateFrom must be a valid ISO date",
    });
  });

  it("should fail when dateTo is invalid (400)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ dateTo: "invalid-date" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_query);
    expect(res.body.description).toMatchObject({
      dateTo: "dateTo must be a valid ISO date",
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

  it("should work without date parameters (200)", async () => {
    const doc = {
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv1",
      userId,
      userCellphone: "549111",
      agentData: { agentId: "111", modelLLM: "m1", agentName: "A1" },
      endTime: new Date(),
      durationSeconds: 10,
      tokenUsage: { totalTokens: 3, cost: 0.001 },
      successful: true,
      tags: ["tag1"],
      messageCount: { user: 1, agent: 1, total: 2 },
      metadata: {
        language: "es",
        channel: "whatsapp",
        sentimentTrend: "neutral",
      },
    };
    await Metric.create(doc);

    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({});

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      _id: doc._id,
      conversationId: doc.conversationId,
      userId,
    });
  });

  it("should work with only dateFrom parameter (200)", async () => {
    const doc = {
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv1",
      userId,
      userCellphone: "549111",
      agentData: { agentId: "111", modelLLM: "m1", agentName: "A1" },
      endTime: new Date("2024-01-15T10:00:00Z"),
      durationSeconds: 10,
      tokenUsage: { totalTokens: 3, cost: 0.001 },
      successful: true,
      tags: ["tag1"],
      messageCount: { user: 1, agent: 1, total: 2 },
      metadata: {
        language: "es",
        channel: "whatsapp",
        sentimentTrend: "neutral",
      },
    };
    await Metric.create(doc);

    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ dateFrom: "2024-01-15T00:00:00Z" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      _id: doc._id,
      conversationId: doc.conversationId,
      userId,
    });
  });

  it("should work with only dateTo parameter (200)", async () => {
    const doc = {
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv1",
      userId,
      userCellphone: "549111",
      agentData: { agentId: "111", modelLLM: "m1", agentName: "A1" },
      endTime: new Date("2024-01-15T10:00:00Z"),
      durationSeconds: 10,
      tokenUsage: { totalTokens: 3, cost: 0.001 },
      successful: true,
      tags: ["tag1"],
      messageCount: { user: 1, agent: 1, total: 2 },
      metadata: {
        language: "es",
        channel: "whatsapp",
        sentimentTrend: "neutral",
      },
    };
    await Metric.create(doc);

    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ dateTo: "2024-01-15T23:59:59Z" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      _id: doc._id,
      conversationId: doc.conversationId,
      userId,
    });
  });

  it("should work with both dateFrom and dateTo parameters (200)", async () => {
    const doc = {
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv1",
      userId,
      userCellphone: "549111",
      agentData: { agentId: "111", modelLLM: "m1", agentName: "A1" },
      endTime: new Date("2024-01-15T10:00:00Z"),
      durationSeconds: 10,
      tokenUsage: { totalTokens: 3, cost: 0.001 },
      successful: true,
      tags: ["tag1"],
      messageCount: { user: 1, agent: 1, total: 2 },
      metadata: {
        language: "es",
        channel: "whatsapp",
        sentimentTrend: "neutral",
      },
    };
    await Metric.create(doc);

    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({
        dateFrom: "2024-01-15T00:00:00Z",
        dateTo: "2024-01-15T23:59:59Z",
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      _id: doc._id,
      conversationId: doc.conversationId,
      userId,
    });
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
      .query({});

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

  it("should filter metrics by date range (200)", async () => {
    const baseDate = new Date("2024-01-15T10:00:00Z");

    const doc1 = {
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv1",
      userId,
      userCellphone: "549111",
      agentData: { agentId: "111", modelLLM: "m1", agentName: "A1" },
      endTime: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      durationSeconds: 10,
      tokenUsage: { totalTokens: 3, cost: 0.001 },
      successful: true,
      tags: ["tag1"],
      messageCount: { user: 1, agent: 1, total: 2 },
      metadata: {
        language: "es",
        channel: "whatsapp",
        sentimentTrend: "neutral",
      },
    };

    const doc2 = {
      ...doc1,
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv2",
      agentData: { agentId: "222", modelLLM: "m2", agentName: "A2" },
      endTime: baseDate, // exact date
    };

    const doc3 = {
      ...doc1,
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "conv3",
      agentData: { agentId: "333", modelLLM: "m3", agentName: "A3" },
      endTime: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after
    };

    await Metric.create([doc1, doc2, doc3]);

    const res1 = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ dateFrom: "2024-01-15T00:00:00Z" });

    expect(res1.status).toBe(200);
    expect(res1.body).toHaveLength(2); // doc2 and doc3
    expect(res1.body.map((m) => m.conversationId)).toContain("conv2");
    expect(res1.body.map((m) => m.conversationId)).toContain("conv3");

    const res2 = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ dateTo: "2024-01-15T23:59:59Z" });

    expect(res2.status).toBe(200);
    expect(res2.body).toHaveLength(2); // doc1 and doc2
    expect(res2.body.map((m) => m.conversationId)).toContain("conv1");
    expect(res2.body.map((m) => m.conversationId)).toContain("conv2");

    const res3 = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({
        dateFrom: "2024-01-15T00:00:00Z",
        dateTo: "2024-01-15T23:59:59Z",
      });

    expect(res3.status).toBe(200);
    expect(res3.body).toHaveLength(1); // only doc2
    expect(res3.body[0].conversationId).toBe("conv2");
  });
});
