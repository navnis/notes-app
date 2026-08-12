import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "./password.js";

describe("password", () => {
  it("hashes a password to something other than the plaintext", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
  });

  it("matches the original password against its own hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(comparePassword("correct-horse-battery-staple", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password against a hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(comparePassword("wrong-password", hash)).resolves.toBe(false);
  });
});
