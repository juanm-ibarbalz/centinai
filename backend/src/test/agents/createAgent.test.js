import request from "supertest";
import app from "../../app.js";
import { getTestUserToken } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import Agent from "../../models/Agent.js";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/config.js";
import { limitsConfig } from "../../config/config.js";

describe("POST /agents", () => {
  const endpoint = "/agents";
  let token;
  let userId;

  beforeAll(async () => {
    token = await getTestUserToken();
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    userId = decoded.userId;
  });

  afterEach(async () => {
    await Agent.deleteMany({ userId });
  });

  it("should create a new agent (201)", async () => {
    const payload = {
      name: "Agent A",
      phoneNumberId: "phone-123",
      payloadFormat: "structured",
      authMode: "query",
      modelName: "gpt-3.5-turbo",
    };

    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: payload.name,
      phoneNumberId: payload.phoneNumberId,
      payloadFormat: payload.payloadFormat,
      authMode: payload.authMode,
      secretToken: expect.any(String),
    });
  });

  it("should fail when payload is missing (400)", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
  });

  it("should fail on duplicate phoneNumberId (400)", async () => {
    const payload = {
      name: "Agent A",
      phoneNumberId: "phone-123",
      payloadFormat: "structured",
      authMode: "query",
      modelName: "gpt-3.5-turbo",
    };

    // primer registro
    await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    // duplicado
    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      errorMessages.agent_already_exists
    );
  });

  it("should fail when exceeding max agents per user (400)", async () => {
    const basePayload = {
      name: "Agent A",
      payloadFormat: "structured",
      authMode: "query",
      modelName: "gpt-3.5-turbo",
    };

    for (let i = 0; i < limitsConfig.maxAgentsPerUser; i++) {
      await request(app)
        .post(endpoint)
        .set("Authorization", `Bearer ${token}`)
        .send({ ...basePayload, phoneNumberId: `phone-${i}` });
    }

    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...basePayload, phoneNumberId: "phone-extra" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.max_agents_reached);
  });

  it("should fail for cross logic: custom format requires fieldMapping (400)", async () => {
    const payload = {
      name: "Agent A",
      phoneNumberId: "phone-999",
      payloadFormat: "custom",
      authMode: "query",
      modelName: "gpt-3.5-turbo",
    };

    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body).toHaveProperty(
      "description",
      "El fieldMapping debe incluir como mínimo: text, from y timestamp"
    );
  });

  it("should fail for cross logic: structured format rejects fieldMapping (400)", async () => {
    const payload = {
      name: "Agent A",
      phoneNumberId: "phone-888",
      payloadFormat: "structured",
      authMode: "query",
      fieldMapping: { foo: "bar" },
      modelName: "gpt-3.5-turbo",
    };

    const res = await request(app)
      .post(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body).toHaveProperty(
      "description",
      "No se permite definir fieldMapping con formato 'structured'"
    );
  });
});
