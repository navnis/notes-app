const SORTABLE_FIELDS = new Set(["updatedAt", "createdAt", "title"]);
const VIEW_FIELDS = { favorites: "isFavorite", pinned: "isPinned" } as const;
const DEFAULT_PAGE_SIZE = 10;

export interface ParsedListQuery {
  page: number;
  limit: number;
  sortField: "updatedAt" | "createdAt" | "title";
  filter: Record<string, unknown>;
}

// Pure parsing of GET /api/notes' query params, split out so it's unit testable without a live DB.
export function parseListNotesQuery(
  userId: string,
  query: { search?: unknown; tag?: unknown; view?: unknown; sort?: unknown; page?: unknown; limit?: unknown },
): ParsedListQuery {
  // Absent means "use the default"; an explicit 0/-5 should just clamp to 1, not fall back to it.
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
  if (typeof query.view === "string" && query.view in VIEW_FIELDS) {
    filter[VIEW_FIELDS[query.view as keyof typeof VIEW_FIELDS]] = true;
  }

  return { page, limit, sortField, filter };
}
