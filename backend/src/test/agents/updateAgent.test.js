import request from "supertest";
import app from "../../app.js";
import { getTestUserToken } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import Agent from "../../models/Agent.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/config.js";

describe("PATCH /agents/:id", () => {
  const endpoint = "/agents";
  let token;
  let userId;
  let agentId;
  let otherAgentId;
  let originalAgentData;

  beforeAll(async () => {
    token = await getTestUserToken();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    userId = decoded.userId;

    const agent = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      phoneNumberId: "phone-upd",
      name: "Original Name",
      description: "Original Description",
      payloadFormat: "custom",
      authMode: "query",
      fieldMapping: { text: "msg.text", from: "msg.from", timestamp: "msg.ts" },
      modelName: "OriginalModel",
      secretToken: new mongoose.Types.ObjectId().toString(),
    });
    agentId = agent._id.toString();
    originalAgentData = agent.toObject();

    const other = await Agent.create({
      _id: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      phoneNumberId: "phone-other",
      name: "Other Name",
      description: "Other Desc",
      payloadFormat: "custom",
      authMode: "query",
      fieldMapping: {},
      modelName: "OtherModel",
      secretToken: new mongoose.Types.ObjectId().toString(),
    });
    otherAgentId = other._id.toString();
  });

  afterAll(async () => {
    await Agent.deleteMany({});
  });

  it("should update name and description successfully (200)", async () => {
    const update = { name: "New Name", description: "New Desc" };
    const res = await request(app)
      .patch(`${endpoint}/${agentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(update);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Agent updated successfully");
    expect(res.body.agent).toMatchObject({
      id: agentId,
      name: update.name,
      description: update.description,
      phoneNumberId: originalAgentData.phoneNumberId,
      payloadFormat: originalAgentData.payloadFormat,
      authMode: originalAgentData.authMode,
      fieldMapping: originalAgentData.fieldMapping,
      modelName: originalAgentData.modelName,
    });
  });

  it("should update modelName and authMode successfully (200)", async () => {
    const update = { modelName: "NewModel", authMode: "header" };
    const res = await request(app)
      .patch(`${endpoint}/${agentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(update);

    expect(res.status).toBe(200);
    expect(res.body.agent).toMatchObject({
      id: agentId,
      modelName: update.modelName,
      authMode: update.authMode,
    });
  });

  it("should clear fieldMapping when changing payloadFormat to structured (200)", async () => {
    const res = await request(app)
      .patch(`${endpoint}/${agentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ payloadFormat: "structured" });

    expect(res.status).toBe(200);
    expect(res.body.agent.payloadFormat).toBe("structured");
    expect(res.body.agent.fieldMapping).toEqual({});
  });

  it("should fail when invalid payload (400)", async () => {
    const res = await request(app)
      .patch(`${endpoint}/${agentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ payloadFormat: "invalid-format" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body.description).toMatchObject({
      payloadFormat:
        "Invalid enum value. Expected 'structured' | 'custom', received 'invalid-format'",
    });
  });

  it("should fail when agent not found (404)", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`${endpoint}/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Doesn't matter" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should fail when agent belongs to another user (404)", async () => {
    const res = await request(app)
      .patch(`${endpoint}/${otherAgentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nope" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should fail when modifying the phoneNumberId if included in body (200)", async () => {
    const update = { phoneNumberId: "new-phone" };
    const res = await request(app)
      .patch(`${endpoint}/${agentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(update);

    expect(res.status).toBe(200);
    expect(res.body.agent.phoneNumberId).toBe(originalAgentData.phoneNumberId);
  });
});
