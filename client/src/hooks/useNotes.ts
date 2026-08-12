import { useQuery, useMutation } from "@tanstack/react-query";
import type { UpdateNoteInput } from "@notes/shared";
import { listNotesRequest, createNoteRequest, updateNoteRequest, deleteNoteRequest } from "@/api/notes";

export const notesQueryKey = ["notes"] as const;

export function useNotes() {
  return useQuery({
    queryKey: notesQueryKey,
    queryFn: listNotesRequest,
  });
}

export function useCreateNote() {
  return useMutation({
    mutationFn: createNoteRequest,
  });
}

export function useUpdateNote() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) => updateNoteRequest(id, input),
  });
}

export function useDeleteNote() {
  return useMutation({
    mutationFn: deleteNoteRequest,
  });
}
