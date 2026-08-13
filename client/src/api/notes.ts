import type {
  CreateNoteInput,
  ListNotesParams,
  ListNotesResponse,
  Note,
  UpdateNoteInput,
} from "@notes/shared";
import { apiFetch } from "@/lib/api";

export function listNotesRequest(params: ListNotesParams = {}): Promise<ListNotesResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.tag) query.set("tag", params.tag);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  return apiFetch<ListNotesResponse>(`/api/notes${queryString ? `?${queryString}` : ""}`);
}

export function getNoteRequest(id: string): Promise<Note> {
  return apiFetch<Note>(`/api/notes/${id}`);
}

export function createNoteRequest(input: CreateNoteInput): Promise<Note> {
  return apiFetch<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateNoteRequest(id: string, input: UpdateNoteInput): Promise<Note> {
  return apiFetch<Note>(`/api/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteNoteRequest(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/notes/${id}`, {
    method: "DELETE",
  });
}
