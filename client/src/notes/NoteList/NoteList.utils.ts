import type { NoteListItem } from "./types";

export function filterAndSortNotes(
  notes: NoteListItem[],
  query: string,
  sortBy: string,
): NoteListItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? notes.filter((note) =>
        [note.title, note.preview, ...note.tags.map((tag) => tag.name)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : notes;

  return [...filtered].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    const field = sortBy === "createdAt" ? (a.createdAt ? "createdAt" : "updatedAt") : "updatedAt";
    return new Date(b[field] ?? b.updatedAt).getTime() - new Date(a[field] ?? a.updatedAt).getTime();
  });
}
