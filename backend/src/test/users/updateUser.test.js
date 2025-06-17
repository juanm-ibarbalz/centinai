import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { getTestUserToken, TEST_USER } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import { authConfig } from "../../config/config.js";

describe("PATCH /users/me", () => {
  const endpoint = "/users/me";
  let token;
  let userId;

  beforeAll(async () => {
    token = await getTestUserToken();
    userId = jwt.verify(token, authConfig.jwtSecret).userId;
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  it("should fail for invalid payload (400)", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ foo: "bar" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
  });

  it("should fail when email unchanged (400)", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body.description).toHaveProperty(
      "message",
      "El email no ha cambiado"
    );
  });

  it("should fail when name unchanged (400)", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: TEST_USER.name });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body.description).toHaveProperty(
      "message",
      "El name no ha cambiado"
    );
  });

  it("should fail when email already in use (400)", async () => {
    await User.create({
      _id: new mongoose.Types.ObjectId().toString(),
      email: "taken@example.com",
      password: await bcrypt.hash("foo", 10),
      name: "Other",
    });

    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "taken@example.com" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", errorMessages.invalid_payload);
    expect(res.body.description).toHaveProperty(
      "message",
      "El email ya está en uso"
    );
  });

  it("should fail if user not found (404)", async () => {
    await User.deleteOne({ _id: userId });
    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.user_not_found);

    await User.create({
      _id: userId,
      email: "test@example.com",
      password: await bcrypt.hash("contrasenia", 10),
      name: "Original Name",
    });
  });

  it("should update name only (200)", async () => {
    const newName = "New Name";

    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: newName });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Usuario actualizado correctamente"
    );
    expect(res.body.user).toMatchObject({
      id: userId,
      email: expect.any(String),
      name: newName,
    });
  });

  it("should update email only (200)", async () => {
    const newEmail = "new@example.com";

    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: newEmail });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Usuario actualizado correctamente"
    );
    expect(res.body.user).toMatchObject({
      id: userId,
      email: newEmail,
      name: expect.any(String),
    });
  });

  it("should update both name and email (200)", async () => {
    const newName = "Final Name";
    const newEmail = "final@example.com";

    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: newName, email: newEmail });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: userId,
      name: newName,
      email: newEmail,
    });
  });
});
