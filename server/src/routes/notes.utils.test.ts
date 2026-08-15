import { describe, expect, it } from "vitest";
import { parseListNotesQuery } from "./notes.utils.js";

const USER_ID = "user-1";

describe("parseListNotesQuery", () => {
  it("defaults to page 1, limit 10, sorted by updatedAt, scoped to the user", () => {
    const result = parseListNotesQuery(USER_ID, {});
    expect(result).toEqual({
      page: 1,
      limit: 10,
      sortField: "updatedAt",
      filter: { userId: USER_ID },
    });
  });

  it("parses page and limit from the query string", () => {
    const result = parseListNotesQuery(USER_ID, { page: "3", limit: "25" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
  });

  it("clamps page and limit to at least 1 for invalid or non-positive input", () => {
    expect(parseListNotesQuery(USER_ID, { page: "0" }).page).toBe(1);
    expect(parseListNotesQuery(USER_ID, { page: "-5" }).page).toBe(1);
    expect(parseListNotesQuery(USER_ID, { page: "not-a-number" }).page).toBe(1);
    expect(parseListNotesQuery(USER_ID, { limit: "0" }).limit).toBe(1);
  });

  it("only accepts known sort fields, falling back to updatedAt otherwise", () => {
    expect(parseListNotesQuery(USER_ID, { sort: "title" }).sortField).toBe("title");
    expect(parseListNotesQuery(USER_ID, { sort: "createdAt" }).sortField).toBe("createdAt");
    expect(parseListNotesQuery(USER_ID, { sort: "not-a-field" }).sortField).toBe("updatedAt");
  });

  it("builds a case-insensitive $or filter on title/content for a search term", () => {
    const result = parseListNotesQuery(USER_ID, { search: "meeting notes" });
    expect(result.filter.$or).toEqual([
      { title: expect.any(RegExp) },
      { content: expect.any(RegExp) },
    ]);
    const [{ title }] = result.filter.$or as { title: RegExp }[];
    expect(title.test("Meeting Notes")).toBe(true);
    expect(title.test("unrelated")).toBe(false);
  });

  it("escapes regex metacharacters in the search term instead of treating it as a pattern", () => {
    const result = parseListNotesQuery(USER_ID, { search: "a.*b" });
    const [{ title }] = result.filter.$or as { title: RegExp }[];
    expect(title.test("a.*b")).toBe(true);
    expect(title.test("aXXb")).toBe(false);
  });

  it("ignores a blank/whitespace-only search term", () => {
    expect(parseListNotesQuery(USER_ID, { search: "   " }).filter).not.toHaveProperty("$or");
  });

  it("filters by an exact tag match when tag is given", () => {
    const result = parseListNotesQuery(USER_ID, { tag: "frontend" });
    expect(result.filter.tags).toBe("frontend");
  });

  it("ignores a blank tag param", () => {
    expect(parseListNotesQuery(USER_ID, { tag: "  " }).filter).not.toHaveProperty("tags");
  });

  it("filters by isFavorite when view=favorites", () => {
    const result = parseListNotesQuery(USER_ID, { view: "favorites" });
    expect(result.filter.isFavorite).toBe(true);
    expect(result.filter).not.toHaveProperty("isPinned");
  });

  it("filters by isPinned when view=pinned", () => {
    const result = parseListNotesQuery(USER_ID, { view: "pinned" });
    expect(result.filter.isPinned).toBe(true);
    expect(result.filter).not.toHaveProperty("isFavorite");
  });

  it("ignores an unknown view value", () => {
    const result = parseListNotesQuery(USER_ID, { view: "trash" });
    expect(result.filter).not.toHaveProperty("isFavorite");
    expect(result.filter).not.toHaveProperty("isPinned");
  });

  it("combines a view filter with a tag filter", () => {
    const result = parseListNotesQuery(USER_ID, { view: "pinned", tag: "frontend" });
    expect(result.filter.isPinned).toBe(true);
    expect(result.filter.tags).toBe("frontend");
  });
});
