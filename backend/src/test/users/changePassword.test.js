import request from "supertest";
import app from "../../app.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { getTestUserToken, TEST_USER } from "../utils.js";
import { errorMessages } from "../../utils/errorMessages.js";
import { authConfig } from "../../config/config.js";

describe("PATCH /users/me/password", () => {
  const endpoint = "/users/me/password";
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

  it("should fail for user not found (404)", async () => {
    await User.deleteOne({ _id: userId });
    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: TEST_USER.password, newPassword: "newPass123" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", errorMessages.user_not_found);

    await User.create({
      _id: userId,
      email: TEST_USER.email,
      password: await bcrypt.hash(TEST_USER.password, 10),
      name: TEST_USER.name,
    });
  });

  it("should fail for incorrect current password (401)", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "wrongPass", newPassword: "newPass123" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Contraseña actual incorrecta");
  });

  it("should update password successfully (200)", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: TEST_USER.password, newPassword: "newPass123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Contraseña actualizada correctamente"
    );

    const updatedUser = await User.findById(userId);
    const isMatch = await bcrypt.compare("newPass123", updatedUser.password);
    expect(isMatch).toBe(true);
  });
});
