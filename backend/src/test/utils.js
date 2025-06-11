import request from "supertest";
import app from "../app.js";

// Credenciales del seed user
export const TEST_USER = { email: "juanmartin@test.com", password: "12345678" };

// login con token
export async function getTestUserToken() {
  const res = await request(app).post("/auth/login").send(TEST_USER);
  return res.body.token;
}

// agente de prueba
export async function createAgent(token, overrides = {}) {
  const defaultPayload = {
    phoneNumberId: "5551234",
    name: "Test Agent",
    modelName: "gpt-4",
    payloadFormat: "structured",
    authMode: "header",
  };

  const payload = { ...defaultPayload, ...overrides };

  // si es custom, asegurar fieldMapping válido
  if (payload.payloadFormat === "custom" && !payload.fieldMapping) {
    payload.fieldMapping = {
      text: "body.message",
      from: "body.sender",
      timestamp: "body.time",
    };
  }

  const res = await request(app)
    .post("/agents")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  return res.body.phoneNumberId;
}
