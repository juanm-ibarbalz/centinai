import request from "supertest";
import app from "../app.js";

// Seed user credentials
export const TEST_USER = {
  email: "juanmartin@test.com",
  password: "12345678",
  name: "Juan Martín",
};

// login with token
export async function getTestUserToken() {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: TEST_USER.email, password: TEST_USER.password });
  return res.body.token;
}

// test agent
export async function createAgent(token, overrides = {}) {
  const defaultPayload = {
    phoneNumberId: "5551234",
    name: "Test Agent",
    modelName: "gpt-4",
    payloadFormat: "structured",
    authMode: "header",
  };

  const payload = { ...defaultPayload, ...overrides };

  // if payloadFormat is "custom", ensure a valid fieldMapping is provided
  if (payload.payloadFormat === "custom" && !payload.fieldMapping) {
    payload.fieldMapping = {
      text: "body.message",
      from: "body.sender",
      timestamp: "body.time",
      to: "body.recipient",
    };
  }

  const res = await request(app)
    .post("/agents")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  return res.body.phoneNumberId;
}
