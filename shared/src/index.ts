export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  /** When this note was last pinned; null if never pinned or currently unpinned. */
  pinnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
}

export type NoteSortField = "updatedAt" | "createdAt" | "title";

/** "favorites"/"pinned" filter to just that subset; omitted means no filter on either. */
export type NoteView = "favorites" | "pinned";

export interface ListNotesParams {
  search?: string;
  tag?: string;
  view?: NoteView;
  sort?: NoteSortField;
  page?: number;
  limit?: number;
}

export interface ListNotesResponse {
  notes: Note[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  /** Always scoped to just the user, not the active search/tag/view filter — for sidebar counts. */
  allNotesCount: number;
  favoritesCount: number;
  pinnedCount: number;
}

export interface ApiResponse<T> {
  data: T;
}

/** The raw shape GET /api/tags returns — tag names are unique per user, so
 * there's no separate id on the wire (the client derives one, see api/tags.ts). */
export interface TagSummary {
  name: string;
  /** Number of the user's notes currently using this tag. */
  count: number;
}

export interface Tag extends TagSummary {
  id: string;
}
