import type { SelectOption } from "@/components";

export const SORT_OPTIONS: SelectOption[] = [
  { value: "updatedAt", label: "Recently Updated" },
  { value: "createdAt", label: "Date Created" },
  { value: "title", label: "Title" },
];

// How long to wait after the last keystroke before the search actually
// hits the server — matches NoteEditor's autosave debounce for consistency.
export const SEARCH_DEBOUNCE_MS = 800;
