import { describe, expect, it } from "vitest";
import { createNoteSchema, updateNoteSchema } from "./noteSchemas.js";

describe("createNoteSchema", () => {
  it("accepts a valid note and trims the title", () => {
    const result = createNoteSchema.parse({ title: "  My note  ", content: "Some content" });
    expect(result.title).toBe("My note");
  });

  it("allows content to be omitted", () => {
    const result = createNoteSchema.parse({ title: "My note" });
    expect(result.content).toBeUndefined();
  });

  it("rejects an empty title", () => {
    expect(() => createNoteSchema.parse({ title: "" })).toThrow();
  });

  it("rejects a title that is only whitespace", () => {
    expect(() => createNoteSchema.parse({ title: "   " })).toThrow();
  });

  it("rejects a missing title", () => {
    expect(() => createNoteSchema.parse({ content: "Some content" })).toThrow();
  });

  it("allows tags to be omitted", () => {
    const result = createNoteSchema.parse({ title: "My note" });
    expect(result.tags).toBeUndefined();
  });

  it("trims tags and drops empty ones", () => {
    const result = createNoteSchema.parse({ title: "My note", tags: ["  frontend  ", "  "] });
    expect(result.tags).toEqual(["frontend"]);
  });

  it("dedupes tags case-insensitively, keeping the first-seen casing", () => {
    const result = createNoteSchema.parse({
      title: "My note",
      tags: ["Frontend", "frontend", "API"],
    });
    expect(result.tags).toEqual(["Frontend", "API"]);
  });

  it("rejects a tag containing a space", () => {
    expect(() => createNoteSchema.parse({ title: "My note", tags: ["ice tag"] })).toThrow();
  });

  it("rejects a tag containing punctuation", () => {
    expect(() => createNoteSchema.parse({ title: "My note", tags: ["c++"] })).toThrow();
  });

  it("allows unicode letters and underscores in a tag", () => {
    const result = createNoteSchema.parse({ title: "My note", tags: ["café", "日本語", "my_tag"] });
    expect(result.tags).toEqual(["café", "日本語", "my_tag"]);
  });
});

describe("updateNoteSchema", () => {
  it("accepts a partial update with just content", () => {
    const result = updateNoteSchema.parse({ content: "Updated content" });
    expect(result).toEqual({ content: "Updated content" });
  });

  it("accepts an empty object (no-op update)", () => {
    expect(updateNoteSchema.parse({})).toEqual({});
  });

  it("rejects an empty-string title", () => {
    expect(() => updateNoteSchema.parse({ title: "" })).toThrow();
  });

  it("trims a given title", () => {
    const result = updateNoteSchema.parse({ title: "  Renamed  " });
    expect(result.title).toBe("Renamed");
  });

  it("trims and dedupes tags on a partial update", () => {
    const result = updateNoteSchema.parse({ tags: ["  backend  ", "backend", "Backend"] });
    expect(result.tags).toEqual(["backend"]);
  });
});
