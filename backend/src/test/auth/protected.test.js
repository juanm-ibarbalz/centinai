import request from "supertest";
import app from "../../app.js";
import { errorMessages } from "../../utils/errorMessages.js";
import { getTestUserToken } from "../utils.js";

describe("GET /auth/protected", () => {
  const endpoint = "/auth/protected";
  let token;

  beforeAll(async () => {
    token = await getTestUserToken();
  });

  it("should reject requests without a token (401)", async () => {
    const res = await request(app).get(endpoint);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", errorMessages.missing_token);
  });

  it("should reject requests with an invalid token (403)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", "Bearer invalid.token");
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_token);
  });

  it("should allow access with a valid token (200)", async () => {
    const res = await request(app)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: expect.any(String),
      user: {
        id: expect.any(String),
        email: expect.any(String),
      },
    });
  });
});
