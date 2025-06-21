import request from "supertest";
import app from "../../app.js";
import { getTestUserToken } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import Agent from "../../models/Agent.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/config.js";

describe("PATCH /agents/:id/mapping", () => {
  const baseEndpoint = "/agents";
  let token;
  let userId;
  let customAgentId;
  let structuredAgentId;

  beforeAll(async () => {
    token = await getTestUserToken();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    userId = decoded.userId;

    customAgentId = new mongoose.Types.ObjectId().toString();
    await Agent.create({
      _id: customAgentId,
      userId,
      modelName: "CustomModel",
      name: "Custom Agent",
      phoneNumberId: "phone-custom",
      payloadFormat: "custom",
      authMode: "query",
      fieldMapping: { text: "msg.text", from: "msg.from", timestamp: "msg.ts" },
      secretToken: "123",
    });

    structuredAgentId = new mongoose.Types.ObjectId().toString();
    await Agent.create({
      _id: structuredAgentId,
      userId,
      modelName: "StructuredModel",
      name: "Structured Agent",
      phoneNumberId: "phone-structured",
      payloadFormat: "structured",
      authMode: "query",
      fieldMapping: {},
      secretToken: "456",
    });
  });

  afterAll(async () => {
    await Agent.deleteMany({ userId });
  });

  it("should successfully update custom agent mapping (200)", async () => {
    const newMapping = {
      fieldMapping: {
        text: "msg.text",
        from: "msg.from",
        timestamp: "msg.ts",
        to: "msg.to",
        extra: "msg.extra", // no deberia tomarlo en cuenta
      },
    };
    const res = await request(app)
      .patch(`${baseEndpoint}/${customAgentId}/mapping`)
      .set("Authorization", `Bearer ${token}`)
      .send(newMapping);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Mapping updated successfully");
    expect(res.body.fieldMapping).toMatchObject(newMapping.fieldMapping);
  });

  it("should fail when missing required keys (400)", async () => {
    const invalidMapping = {
      fieldMapping: { text: "msg.text", from: "msg.from" },
    };
    const res = await request(app)
      .patch(`${baseEndpoint}/${customAgentId}/mapping`)
      .set("Authorization", `Bearer ${token}`)
      .send(invalidMapping);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body).toHaveProperty(
      "description",
      "fieldMapping must include at minimum: text, from, timestamp and to"
    );
  });

  it("should fail when structured agent mapping provided (400)", async () => {
    const invalidMapping = { fieldMapping: { foo: "bar" } };
    const res = await request(app)
      .patch(`${baseEndpoint}/${structuredAgentId}/mapping`)
      .set("Authorization", `Bearer ${token}`)
      .send(invalidMapping);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body).toHaveProperty(
      "description",
      "fieldMapping is not allowed with 'structured' format"
    );
  });

  it("should fail if agent not found (404)", async () => {
    const fakeId = "fake-id";
    const res = await request(app)
      .patch(`${baseEndpoint}/${fakeId}/mapping`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });
});
