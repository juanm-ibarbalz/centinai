import request from "supertest";
import app from "../../app.js";
import { getTestUserToken } from "../utils.js";
import Agent from "../../models/Agent.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/config.js";

describe("GET /agents", () => {
  const endpoint = "/agents";
  let token;
  let userId;

  beforeAll(async () => {
    token = await getTestUserToken();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    userId = decoded.userId;
  });

  afterEach(async () => {
    await Agent.deleteMany({});
  });

  it("should return empty array when user has no agents (200)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it("should return only agents belonging to the user (200)", async () => {
    const agent1 = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      modelName: "ModelOne",
      name: "Agent One",
      phoneNumberId: "phone-1",
      payloadFormat: "structured",
      authMode: "query",
      secretToken: "dummy1",
    });
    const agent2 = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      modelName: "ModelTwo",
      name: "Agent Two",
      phoneNumberId: "phone-2",
      payloadFormat: "structured",
      authMode: "query",
      secretToken: "dummy2",
    });
    const otherAgent = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      modelName: "OtherModel",
      name: "Agent Other",
      phoneNumberId: "phone-other",
      payloadFormat: "structured",
      authMode: "query",
      secretToken: "dummy3",
    });

    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: agent1._id.toString(),
          authMode: "query",
          name: "Agent One",
          phoneNumberId: "phone-1",
          modelName: "ModelOne",
        }),
        expect.objectContaining({
          _id: agent2._id.toString(),
          authMode: "query",
          name: "Agent Two",
          phoneNumberId: "phone-2",
          modelName: "ModelTwo",
        }),
      ])
    );
  });
});
