import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { getTestUserToken } from "../utils.js";
import Metric from "../../models/Metric.js";
import { authConfig } from "../../config/config.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("GET /metrics/:conversationId", () => {
  const base = "/metrics";
  let token, userId;

  beforeAll(async () => {
    token = await getTestUserToken();
    userId = jwt.verify(token, authConfig.jwtSecret).userId;
  });

  afterEach(async () => {
    await Metric.deleteMany({ userId });
  });

  it("should fail when conversationId param is missing or empty (400)", async () => {
    const res = await request(app)
      .get(`${base}/`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_query);
  });

  it("should return null when metric not found (404)", async () => {
    const fakeConv = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`${base}/${fakeConv}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.metric_not_found);
    expect(res.body).not.toHaveProperty("description");
  });

  it("should return metric object when found (200)", async () => {
    const metric = await Metric.create({
      _id: new mongoose.Types.ObjectId().toString(),
      conversationId: "convGood",
      userId,
      userCellphone: "549111",
      agentData: { agentId: "111", modelLLM: "m1", agentName: "A1" },
      endTime: new Date(),
      durationSeconds: 12,
      tokenUsage: {
        promptTokens: 2,
        completionTokens: 3,
        totalTokens: 5,
        cost: 0.002,
      },
      successful: true,
      tags: ["ok"],
      messageCount: { user: 2, agent: 2, total: 4 },
      metadata: { language: "es", channel: "web", sentimentTrend: "positive" },
    });

    const res = await request(app)
      .get(`${base}/${metric.conversationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      _id: metric._id,
      conversationId: metric.conversationId,
      userId,
      userCellphone: metric.userCellphone,
    });
  });
});
