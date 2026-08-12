import type { CreateNoteInput, Note, UpdateNoteInput } from "@notes/shared";
import { apiFetch } from "@/lib/api";

export function createNoteRequest(input: CreateNoteInput): Promise<Note> {
  return apiFetch<Note>("/api/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateNoteRequest(id: string, input: UpdateNoteInput): Promise<Note> {
  return apiFetch<Note>(`/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
