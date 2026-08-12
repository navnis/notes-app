export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface Tag {
  id: string;
  name: string;
  /** Number of notes currently using this tag. */
  count: number;
}
