import request from "supertest";
import app from "../../app.js";
import { getTestUserToken, createAgent } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("GET /conversations", () => {
  const endpoint = "/conversations";
  let token;
  let agentPhoneNumberId;

  beforeAll(async () => {
    token = await getTestUserToken();
    agentPhoneNumberId = await createAgent(token);
  });

  it("should fail when missing agentPhoneNumberId (400)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: errorMessages.invalid_query,
      description: {
        agentPhoneNumberId: expect.any(String),
      },
    });
  });

  it("should fail when agent does not exist (404)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ agentPhoneNumberId: "nonexistent-id" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.agent_not_found);
    expect(res.body).not.toHaveProperty("description");
  });

  it("should return empty array when no conversations (200)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ agentPhoneNumberId });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it("should accept pagination params (200)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .query({ agentPhoneNumberId, limit: 5, offset: 2 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
