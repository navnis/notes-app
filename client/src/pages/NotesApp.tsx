import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NoteSortField } from "@notes/shared";
import { Sidebar, NoteList, NoteEditor } from "@/notes";
import { toast } from "@/components";
import { useNotes, useCreateNote, useDeleteNote } from "@/hooks/useNotes";
import { useTags, tagsQueryKey } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { toPreviewText, toPossessiveAppName } from "./NotesApp.utils";

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
  const { name } = useAuth();
  const appName = useMemo(() => (name ? toPossessiveAppName(name) : "Notes"), [name]);

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

  const handleSortByChange = useCallback((value: string) => setSortBy(value as NoteSortField), []);

  const handleTitleChange = useCallback(
    (title: string) => setNoteOverlay((prev) => (prev ? { ...prev, title } : prev)),
    [],
  );

  const handleContentChange = useCallback(
    (value: string) =>
      setNoteOverlay((prev) => (prev ? { ...prev, content: value, preview: toPreviewText(value) } : prev)),
    [],
  );

  const handleNoteSaved = useCallback(
    (saved: { updatedAt: string; tags: string[] }) =>
      setNoteOverlay((prev) => (prev ? { ...prev, updatedAt: saved.updatedAt, tags: saved.tags } : prev)),
    [],
  );

  const handleNewNote = useCallback(async () => {
    if (createNote.isPending) return;
    try {
      const note = await createNote.mutateAsync({ title: "Untitled Note", content: "" });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNoteId(note.id);
      setNoteOverlay({ ...note, emoji: "📝", preview: toPreviewText(note.content) });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Couldn't create the note. Please try again.";
      toast.error(message);
    }
  }, [createNote, queryClient]);

  // Read via ref so the Ctrl+N listener below is only ever attached once.
  // Cmd+N (not Ctrl+N) is reserved by the browser itself on Mac — it never
  // reaches page JS, so only Ctrl+N is listened for, on every platform.
  const handleNewNoteRef = useRef(handleNewNote);
  handleNewNoteRef.current = handleNewNote;
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "n" || !event.ctrlKey) return;
      event.preventDefault();
      handleNewNoteRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDeleteNote = useCallback(
    async (id: string) => {
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
    },
    [deleteNote, queryClient],
  );

  const openNoteId = selectedNote?.id;
  const handleDeleteSelectedNote = useCallback(() => {
    return openNoteId ? handleDeleteNote(openNoteId) : undefined;
  }, [openNoteId, handleDeleteNote]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 sm:flex-row">
      <Sidebar
        appName={appName}
        allNotesCount={totalCount}
        tags={tags}
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        onNewNote={handleNewNote}
        isCreatingNote={createNote.isPending}
      />
      <NoteList
        className="flex-[2]"
        notes={notes}
        totalCount={totalCount}
        isLoading={isLoading}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={handleNewNote}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
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
          onTitleChange={handleTitleChange}
          value={selectedNote.content}
          onChange={handleContentChange}
          preview={preview}
          onPreviewChange={setPreview}
          onSaved={handleNoteSaved}
          tags={selectedNote.tags}
          onDelete={handleDeleteSelectedNote}
          createdAt={selectedNote.createdAt}
          updatedAt={selectedNote.updatedAt}
        />
      )}
    </div>
  );
}
