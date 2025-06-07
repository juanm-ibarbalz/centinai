import User from "../models/User.js";
import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import connectDB from "../db/connect.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);

  const hashed = await bcrypt.hash("12345678", 10);
  await User.create({
    _id: new mongoose.Types.ObjectId(),
    email: "juanmartin@test.com",
    password: hashed,
    name: "Juan Martín",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
