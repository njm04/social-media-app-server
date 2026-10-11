import request from "supertest";
import bcrypt from "bcryptjs";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";
import app from "../../index";
import User from "../../models/user";
import * as testDb from "../testDb";

beforeAll(async () => await testDb.connect());
afterEach(async () => await testDb.clearDatabase());
afterAll(async () => await testDb.closeDatabase());

const validRegistration = {
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  gender: "female",
  birthDate: "1990-01-01",
  password: "Password123",
};

describe("POST /api/users/register", () => {
  it("returns 400 when the payload fails validation", async () => {
    const { email, ...incomplete } = validRegistration;
    const res = await request(app).post("/api/users/register").send(incomplete);

    expect(res.status).toBe(400);
  });

  it("creates a new user for a valid payload", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send(validRegistration);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(validRegistration.email);
  });

  it("returns 400 when the email is already registered", async () => {
    await request(app).post("/api/users/register").send(validRegistration);
    const res = await request(app)
      .post("/api/users/register")
      .send(validRegistration);

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/already exists/i);
  });
});

describe("GET /api/users/me", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("x-auth-token", "not-a-real-token");

    expect(res.status).toBe(400);
  });

  it("returns the authenticated user without the password field", async () => {
    const password = await bcrypt.hash("Password123", 10);
    const user = new User({ ...validRegistration, password });
    await user.save();
    const token = await user.generateAuthToken();

    const res = await request(app)
      .get("/api/users/me")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(validRegistration.email);
    expect(res.body.password).toBeUndefined();
  });
});
