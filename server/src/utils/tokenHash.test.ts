import { describe, expect, it } from "vitest";
import { hashToken } from "./tokenHash.js";

describe("hashToken", () => {
  it("produces the same hash for the same token", () => {
    expect(hashToken("abc.def.ghi")).toBe(hashToken("abc.def.ghi"));
  });

  it("produces a different hash for a different token", () => {
    expect(hashToken("abc.def.ghi")).not.toBe(hashToken("abc.def.xyz"));
  });

  it("does not return the original token", () => {
    expect(hashToken("abc.def.ghi")).not.toBe("abc.def.ghi");
  });
});
