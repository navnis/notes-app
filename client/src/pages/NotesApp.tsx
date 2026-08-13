import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NoteSortField } from "@notes/shared";
import { Sidebar, NoteList, NoteEditor } from "@/notes";
import { Loading, toast } from "@/components";
import { useNotes, useCreateNote, useDeleteNote } from "@/hooks/useNotes";
import { useTags, tagsQueryKey } from "@/hooks/useTags";
import { ApiError } from "@/lib/api";
import { toPreviewText } from "./NotesApp.utils";

interface NoteItem {
  id: string;
  emoji?: string;
  title: string;
  preview?: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<NoteSortField>("updatedAt");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  // Local overlay for the open note so a background page refetch can't clobber unsaved edits.
  const [noteOverlay, setNoteOverlay] = useState<NoteItem | null>(null);

  const filters = useMemo(
    () => ({ search, tag: selectedTagId, sort: sortBy }),
    [search, selectedTagId, sortBy],
  );
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotes(filters);
  const { data: tags = [] } = useTags();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const queryClient = useQueryClient();

  const pages = useMemo(() => data?.pages ?? [], [data]);
  const totalCount = pages[0]?.total ?? 0;
  const notes: NoteItem[] = useMemo(
    () =>
      pages
        .flatMap((page) => page.notes)
        .map((note) =>
          note.id === noteOverlay?.id
            ? noteOverlay
            : { ...note, emoji: "📝", preview: toPreviewText(note.content) },
        ),
    [pages, noteOverlay],
  );

  useEffect(() => {
    if (isError) toast.error("Couldn't load your notes. Please try again.");
  }, [isError]);

  // Only re-syncs the overlay when the selection itself changes, not on incidental `pages` refetches.
  useEffect(() => {
    if (!selectedNoteId) {
      setNoteOverlay(null);
      return;
    }
    const found = pages.flatMap((page) => page.notes).find((note) => note.id === selectedNoteId);
    if (found) {
      setNoteOverlay({ ...found, emoji: "📝", preview: toPreviewText(found.content) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  async function handleNewNote() {
    try {
      const note = await createNote.mutateAsync({ title: "Untitled Note", content: "" });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNoteId(note.id);
      setNoteOverlay({ ...note, emoji: "📝", preview: toPreviewText(note.content) });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Couldn't create the note. Please try again.";
      toast.error(message);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await deleteNote.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: tagsQueryKey });
      setSelectedNoteId((prev) => (prev === id ? null : prev));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Couldn't delete the note. Please try again.";
      toast.error(message);
      throw error;
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-4">
        <Loading label="Loading notes..." />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 sm:flex-row">
      <Sidebar
        allNotesCount={totalCount}
        tags={tags}
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        onNewNote={handleNewNote}
      />
      <NoteList
        className="flex-[2]"
        notes={notes}
        totalCount={totalCount}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={handleNewNote}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={(value) => setSortBy(value as NoteSortField)}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
      {selectedNote && (
        <NoteEditor
          className="flex-[3]"
          noteId={selectedNote.id}
          emoji={selectedNote.emoji}
          title={selectedNote.title}
          onTitleChange={(title) => setNoteOverlay((prev) => (prev ? { ...prev, title } : prev))}
          value={selectedNote.content}
          onChange={(value) =>
            setNoteOverlay((prev) =>
              prev ? { ...prev, content: value, preview: toPreviewText(value) } : prev,
            )
          }
          preview={preview}
          onPreviewChange={setPreview}
          onSaved={(saved) =>
            setNoteOverlay((prev) =>
              prev ? { ...prev, updatedAt: saved.updatedAt, tags: saved.tags } : prev,
            )
          }
          tags={selectedNote.tags}
          onDelete={() => handleDeleteNote(selectedNote.id)}
          createdAt={selectedNote.createdAt}
          updatedAt={selectedNote.updatedAt}
        />
      )}
    </div>
  );
}
