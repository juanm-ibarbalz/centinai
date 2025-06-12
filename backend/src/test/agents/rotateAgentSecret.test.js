import request from "supertest";
import app from "../../app.js";
import { getTestUserToken } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import Agent from "../../models/Agent.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/config.js";

describe("POST /agents/:id/rotate-secret", () => {
  const baseEndpoint = "/agents";
  let token;
  let userId;
  let agentId;
  let otherAgentId;
  let originalSecret;

  beforeAll(async () => {
    token = await getTestUserToken();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    userId = decoded.userId;

    // Crear un agente para este usuario
    agentId = new mongoose.Types.ObjectId().toString();
    originalSecret = "old-secret";
    await Agent.create({
      _id: agentId,
      userId,
      modelName: "RotateModel",
      name: "Rotate Agent",
      phoneNumberId: "phone-rotate",
      payloadFormat: "structured",
      authMode: "query",
      fieldMapping: {},
      secretToken: originalSecret,
    });

    // Crear un agente para otro usuario
    otherAgentId = new mongoose.Types.ObjectId().toString();
    await Agent.create({
      _id: otherAgentId,
      userId: new mongoose.Types.ObjectId().toString(),
      modelName: "OtherModel",
      name: "Other Agent",
      phoneNumberId: "phone-other",
      payloadFormat: "structured",
      authMode: "query",
      fieldMapping: {},
      secretToken: "secret-other",
    });
  });

  afterAll(async () => {
    await Agent.deleteMany({});
  });

  it("should rotate secret token successfully (200)", async () => {
    const res = await request(app)
      .post(`${baseEndpoint}/${agentId}/rotate-secret`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Secret token regenerado correctamente"
    );
    expect(res.body).toHaveProperty("secretToken");
    expect(typeof res.body.secretToken).toBe("string");
    expect(res.body.secretToken).not.toBe(originalSecret);

    // Verificar en base de datos
    const updated = await Agent.findById(agentId);
    expect(updated.secretToken).toBe(res.body.secretToken);
  });

  it("should fail when agent not found (404)", async () => {
    const fakeId = "fake-id";
    const res = await request(app)
      .post(`${baseEndpoint}/${fakeId}/rotate-secret`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });

  it("should fail when agent belongs to another user (404)", async () => {
    const res = await request(app)
      .post(`${baseEndpoint}/${otherAgentId}/rotate-secret`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
  });
});
