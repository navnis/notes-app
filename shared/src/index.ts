export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
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
}

export type NoteSortField = "updatedAt" | "createdAt" | "title";

export interface ListNotesParams {
  search?: string;
  tag?: string;
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
