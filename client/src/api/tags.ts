import type { Tag, TagSummary } from "@notes/shared";
import { apiFetch } from "@/lib/api";

export async function listTagsRequest(): Promise<Tag[]> {
  const tags = await apiFetch<TagSummary[]>("/api/tags");
  // Tag names are unique per user (the API groups by name) — safe to reuse
  // the name itself as the id the client's Tag components key/select by.
  return tags.map((tag) => ({ ...tag, id: tag.name }));
}
