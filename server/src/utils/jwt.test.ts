import { describe, expect, it } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt.js";

describe("jwt", () => {
  it("round-trips a user id through an access token", () => {
    const token = signAccessToken("user-123");
    expect(verifyAccessToken(token)).toMatchObject({ sub: "user-123" });
  });

  it("round-trips a user id through a refresh token", () => {
    const token = signRefreshToken("user-123");
    expect(verifyRefreshToken(token)).toMatchObject({ sub: "user-123" });
  });

  it("rejects an access token when verified as a refresh token", () => {
    const token = signAccessToken("user-123");
    expect(() => verifyRefreshToken(token)).toThrow();
  });

  it("rejects a tampered token", () => {
    const token = signAccessToken("user-123");
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });
});
