import request from "supertest";
import app from "../app.js";
import { jest } from "@jest/globals";

describe("POST /auth/register", () => {
  const endpoint = "/auth/register";
  jest.setTimeout(15000);

  it("should register a new user (201)", async () => {
    const payload = {
      email: "newuser@example.com",
      password: "Password123!",
      name: "New User",
    };
    const res = await request(app).post(endpoint).send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      message: expect.any(String),
      user: {
        email: payload.email,
        name: payload.name,
        _id: expect.any(String),
      },
    });
  });

  it("should fail when missing fields (400)", async () => {
    const res = await request(app).post(endpoint).send({}); // sin email ni password ni name

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should fail on invalid email format (400)", async () => {
    const res = await request(app).post(endpoint).send({
      email: "not-an-email",
      password: "Password123!",
      name: "Foo",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should fail on too-short password (400)", async () => {
    const res = await request(app).post(endpoint).send({
      email: "valid@example.com",
      password: "123",
      name: "Bar",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should fail when email already exists (409)", async () => {
    // Usamos el email seed ("juanmartin@example.com") que ya existe
    const res = await request(app).post(endpoint).send({
      email: "juanmartin@test.com",
      password: "AnotherPass1!",
      name: "Duplicate",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });
});
