import request from "supertest";
import app from "../../app.js";
import { TEST_USER } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";

describe("POST /auth/login", () => {
  const endpoint = "/auth/login";

  it("should login successfully and return token & user info (200)", async () => {
    const payload = { email: TEST_USER.email, password: TEST_USER.password };

    const res = await request(app).post(endpoint).send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", expect.any(String));
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toMatchObject({
      id: expect.any(String),
      email: payload.email,
    });
  });

  it("should fail when missing fields (400)", async () => {
    const res = await request(app).post(endpoint).send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
  });

  it("should fail on invalid email format (400)", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ email: "not-an-email", password: TEST_USER.password });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body).toHaveProperty("description", {
      email: "Invalid email format",
    });
  });

  it("should fail on invalid password format (400)", async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ email: TEST_USER.email, password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body).toHaveProperty("description", {
      password: "Invalid password",
    });
  });

  it("should fail with wrong password (401)", async () => {
    const res = await request(app).post(endpoint).send({
      email: "juanmartin@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should fail when user does not exist (401)", async () => {
    const res = await request(app).post(endpoint).send({
      email: "doesnotexist@example.com",
      password: "whatever123",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_credentials);
  });
});
