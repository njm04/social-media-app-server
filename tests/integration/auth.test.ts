import request from "supertest";
import bcrypt from "bcryptjs";
import { beforeAll, afterEach, afterAll, describe, expect, it } from "@jest/globals";
import app from "../../index";
import User from "../../models/user";
import * as testDb from "../testDb";

beforeAll(async () => await testDb.connect());
afterEach(async () => await testDb.clearDatabase());
afterAll(async () => await testDb.closeDatabase());

const createUser = async (overrides: Record<string, unknown> = {}) => {
  const password = await bcrypt.hash("Password123", 10);
  const user = new User({
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    gender: "female",
    birthDate: new Date("1990-01-01"),
    password,
    ...overrides,
  });
  await user.save();
  return user;
};

describe("POST /api/auth", () => {
  it("returns 400 when the payload fails validation", async () => {
    const res = await request(app).post("/api/auth").send({ email: "bad" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unknown email", async () => {
    const res = await request(app)
      .post("/api/auth")
      .send({ email: "missing@example.com", password: "Password123" });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/invalid password or email/i);
  });

  it("returns 400 for an incorrect password", async () => {
    await createUser();
    const res = await request(app)
      .post("/api/auth")
      .send({ email: "jane@example.com", password: "wrongPassword" });

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/invalid password or email/i);
  });

  it("returns a JWT for valid credentials", async () => {
    await createUser();
    const res = await request(app)
      .post("/api/auth")
      .send({ email: "jane@example.com", password: "Password123" });

    expect(res.status).toBe(200);
    expect(res.text.split(".")).toHaveLength(3);
  });
});
