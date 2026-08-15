import type { NoteSortField } from "@notes/shared";

const PREVIEW_MAX_LENGTH = 140;

interface SortableNote {
  isPinned?: boolean;
  pinnedAt?: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// Mirrors the server's GET /api/notes sort ({ isPinned: -1, pinnedAt: -1, [sortField] }) so an
// optimistic client-side reorder (e.g. right after pinning) matches what a real refetch would show.
export function compareNotesForSort(sortField: NoteSortField) {
  return (a: SortableNote, b: SortableNote): number => {
    if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isPinned && b.isPinned) {
      const pinnedDiff = (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? "");
      if (pinnedDiff !== 0) return pinnedDiff;
    }
    if (sortField === "title") return a.title.localeCompare(b.title);
    return b[sortField].localeCompare(a[sortField]);
  };
}

// "Rahul Sharma" -> "Rahul's Notes" — just the first name, for the sidebar header.
export function toPossessiveAppName(name: string): string {
  const firstName = name.trim().split(/\s+/)[0];
  return firstName ? `${firstName}'s Notes` : "Notes";
}

// Strips the most common Markdown syntax down to plain text for the note
// list's preview line — doesn't need to be exhaustive, just readable.
export function toPreviewText(content: string): string {
  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > PREVIEW_MAX_LENGTH
    ? `${plainText.slice(0, PREVIEW_MAX_LENGTH).trimEnd()}…`
    : plainText;
}
