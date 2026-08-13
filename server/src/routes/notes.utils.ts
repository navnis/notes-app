const SORTABLE_FIELDS = new Set(["updatedAt", "createdAt", "title"]);
const DEFAULT_PAGE_SIZE = 10;

export interface ParsedListQuery {
  page: number;
  limit: number;
  sortField: "updatedAt" | "createdAt" | "title";
  filter: Record<string, unknown>;
}

// Pure parsing of GET /api/notes' query params into a Mongo filter + sort/
// pagination options — split out from the route handler so it's unit
// testable without a live DB, per this project's server-testing convention.
export function parseListNotesQuery(
  userId: string,
  query: { search?: unknown; tag?: unknown; sort?: unknown; page?: unknown; limit?: unknown },
): ParsedListQuery {
  // query.page/limit being absent is genuinely different from an explicit
  // "0" or "-5" — the former should fall back to the default, the latter
  // should just get clamped to 1 by Math.max below, not silently replaced
  // with the default as if it had been omitted (that's what `||` would do).
  const parsedPage = query.page === undefined ? 1 : Number(query.page);
  const page = Math.max(1, Number.isFinite(parsedPage) ? parsedPage : 1);
  const parsedLimit = query.limit === undefined ? DEFAULT_PAGE_SIZE : Number(query.limit);
  const limit = Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : DEFAULT_PAGE_SIZE);
  const sortField =
    typeof query.sort === "string" && SORTABLE_FIELDS.has(query.sort)
      ? (query.sort as ParsedListQuery["sortField"])
      : "updatedAt";

  const filter: Record<string, unknown> = { userId };
  if (typeof query.search === "string" && query.search.trim()) {
    // Escape regex metacharacters — this is a plain substring search, not a
    // place for the user to inject their own regex.
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    filter.$or = [{ title: pattern }, { content: pattern }];
  }
  if (typeof query.tag === "string" && query.tag.trim()) {
    filter.tags = query.tag.trim();
  }

  return { page, limit, sortField, filter };
}
