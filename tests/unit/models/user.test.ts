import bcrypt from "bcryptjs";
import User, { validate } from "../../../models/user";

describe("User.validate", () => {
  const validPayload = {
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    birthDate: new Date("1990-01-01"),
    gender: "female",
    password: "supersecret",
  };

  it("passes for a valid registration payload", () => {
    const { error } = validate(validPayload);
    expect(error).toBeUndefined();
  });

  it("fails when a required field is missing", () => {
    const { email, ...payloadWithoutEmail } = validPayload;
    const { error } = validate(payloadWithoutEmail);
    expect(error).toBeDefined();
    expect(error?.details[0].message).toMatch(/email/i);
  });

  it("fails for an invalid email format", () => {
    const { error } = validate({ ...validPayload, email: "not-an-email" });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toMatch(/email/i);
  });

  it("fails when password is too short", () => {
    const { error } = validate({ ...validPayload, password: "ab" });
    expect(error).toBeDefined();
    expect(error?.details[0].message).toMatch(/password/i);
  });
});

describe("User.validatePassword", () => {
  it("resolves true for a matching password", async () => {
    const hash = await bcrypt.hash("mySecret1", 10);
    const user = new User();

    await expect(user.validatePassword(hash, "mySecret1")).resolves.toBe(
      true
    );
  });

  it("resolves false for a non-matching password", async () => {
    const hash = await bcrypt.hash("mySecret1", 10);
    const user = new User();

    await expect(user.validatePassword(hash, "wrongPassword")).resolves.toBe(
      false
    );
  });
});
