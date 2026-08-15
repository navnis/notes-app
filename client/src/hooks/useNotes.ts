import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import type { NoteSortField, NoteView, UpdateNoteInput } from "@notes/shared";
import { listNotesRequest, createNoteRequest, updateNoteRequest, deleteNoteRequest } from "@/api/notes";

const NOTES_PAGE_SIZE = 10;

export interface NotesFilters {
  search?: string;
  tag?: string | null;
  view?: NoteView | null;
  sort?: NoteSortField;
}

export function notesQueryKey(filters: NotesFilters = {}) {
  return ["notes", filters] as const;
}

export function useNotes(filters: NotesFilters = {}) {
  return useInfiniteQuery({
    queryKey: notesQueryKey(filters),
    queryFn: ({ pageParam }) =>
      listNotesRequest({
        search: filters.search,
        tag: filters.tag ?? undefined,
        view: filters.view ?? undefined,
        sort: filters.sort,
        page: pageParam,
        limit: NOTES_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
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
