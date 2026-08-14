import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./authSchemas.js";

describe("registerSchema", () => {
  it("accepts a valid registration and normalizes the email", () => {
    const result = registerSchema.parse({
      name: "Rahul",
      email: "  User@Example.com  ",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects a missing name", () => {
    expect(() =>
      registerSchema.parse({
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    ).toThrow();
  });

  it("rejects a name that is only whitespace", () => {
    expect(() =>
      registerSchema.parse({
        name: "   ",
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    ).toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() =>
      registerSchema.parse({
        name: "Rahul",
        email: "not-an-email",
        password: "password123",
        confirmPassword: "password123",
      }),
    ).toThrow();
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(() =>
      registerSchema.parse({
        name: "Rahul",
        email: "user@example.com",
        password: "short",
        confirmPassword: "short",
      }),
    ).toThrow();
  });

  it("rejects mismatched passwords", () => {
    expect(() =>
      registerSchema.parse({
        name: "Rahul",
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password456",
      }),
    ).toThrow();
  });
});

describe("loginSchema", () => {
  it("accepts a valid login and normalizes the email", () => {
    const result = loginSchema.parse({ email: "  User@Example.com  ", password: "anything" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects an empty password", () => {
    expect(() => loginSchema.parse({ email: "user@example.com", password: "" })).toThrow();
  });
});
