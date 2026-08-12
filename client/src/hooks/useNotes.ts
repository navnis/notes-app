import { useMutation } from "@tanstack/react-query";
import type { UpdateNoteInput } from "@notes/shared";
import { createNoteRequest, updateNoteRequest } from "@/api/notes";

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
