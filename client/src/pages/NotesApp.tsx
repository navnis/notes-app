import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { ListNotesResponse, Note, NoteSortField, NoteView } from "@notes/shared";
import { Sidebar, NoteList, NoteEditor } from "@/notes";
import { OfflineBanner, toast } from "@/components";
import { useNotes, useCreateNote, useDeleteNote, type NotesFilters } from "@/hooks/useNotes";
import { useTags, tagsQueryKey } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { ApiError } from "@/lib/api";
import { toPreviewText, toPossessiveAppName, compareNotesForSort } from "./NotesApp.utils";

interface NoteItem {
  id: string;
  emoji?: string;
  title: string;
  preview?: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [search, setSearch] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<NoteView | null>(null);
  const [sortBy, setSortBy] = useState<NoteSortField>("updatedAt");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const isOnline = useOnlineStatus();
  // Local overlay for the open note so a background page refetch can't clobber unsaved edits.
  const [noteOverlay, setNoteOverlay] = useState<NoteItem | null>(null);

  const filters = useMemo(
    () => ({ search, tag: selectedTagId, view: activeView, sort: sortBy }),
    [search, selectedTagId, activeView, sortBy],
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
  const allNotesCount = pages[0]?.allNotesCount ?? 0;
  const favoritesCount = pages[0]?.favoritesCount ?? 0;
  const pinnedCount = pages[0]?.pinnedCount ?? 0;
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

  // Patches one note's fields across every cached notes query, then re-sorts each query's flattened
  // notes by its own active sortField (pinned-first, mirroring the server) and re-slices back into pages —
  // used for the optimistic pin/favorite toggle, its server-confirmed follow-up, and its revert-on-error.
  // Iterates the query cache directly (rather than setQueriesData) since each cached query's own
  // sortField — needed to sort correctly — only lives in that query's queryKey, not in the data itself.
  const patchAndResortNote = useCallback(
    (id: string, changes: Partial<Pick<Note, "isFavorite" | "isPinned" | "pinnedAt" | "updatedAt" | "tags">>) => {
      const queries = queryClient.getQueryCache().findAll({ queryKey: ["notes"] });
      for (const query of queries) {
        const data = query.state.data as InfiniteData<ListNotesResponse> | undefined;
        if (!data) continue;
        const filters = (query.queryKey[1] ?? {}) as NotesFilters;
        const sortField = filters.sort ?? "updatedAt";
        const flatNotes = data.pages
          .flatMap((page) => page.notes)
          .map((note) => (note.id === id ? { ...note, ...changes } : note))
          .sort(compareNotesForSort(sortField));

        let cursor = 0;
        queryClient.setQueryData<InfiniteData<ListNotesResponse>>(query.queryKey, {
          ...data,
          pages: data.pages.map((page) => {
            const slice = flatNotes.slice(cursor, cursor + page.notes.length);
            cursor += page.notes.length;
            return { ...page, notes: slice };
          }),
        });
      }
    },
    [queryClient],
  );

  const handleNoteSaved = useCallback(
    (saved: {
      id: string;
      updatedAt: string;
      tags: string[];
      isFavorite: boolean;
      isPinned: boolean;
      pinnedAt: string | null;
    }) => {
      setNoteOverlay((prev) =>
        prev?.id === saved.id
          ? {
              ...prev,
              updatedAt: saved.updatedAt,
              tags: saved.tags,
              isFavorite: saved.isFavorite,
              isPinned: saved.isPinned,
            }
          : prev,
      );
      // Patch every cached notes query too — not just the overlay — so isFavorite/isPinned
      // stay correct once the overlay is torn down (e.g. after switching selection away and back).
      patchAndResortNote(saved.id, {
        updatedAt: saved.updatedAt,
        tags: saved.tags,
        isFavorite: saved.isFavorite,
        isPinned: saved.isPinned,
        pinnedAt: saved.pinnedAt,
      });
    },
    [patchAndResortNote],
  );

  // Fired the instant a pin/favorite toggle is clicked (before the request resolves) — applies the
  // change and reorders the list right away; pinnedAt is a client-side stand-in until the real
  // server response lands via handleNoteSaved above, which overwrites it with the authoritative value.
  const handleToggleOptimistic = useCallback(
    (id: string, field: "isFavorite" | "isPinned", nextValue: boolean) => {
      if (field === "isPinned") {
        patchAndResortNote(id, { isPinned: nextValue, pinnedAt: nextValue ? new Date().toISOString() : null });
      } else {
        patchAndResortNote(id, { isFavorite: nextValue });
      }
    },
    [patchAndResortNote],
  );

  const handleToggleError = useCallback(
    (id: string, field: "isFavorite" | "isPinned", revertedValue: boolean) => {
      if (field === "isPinned") {
        patchAndResortNote(id, {
          isPinned: revertedValue,
          pinnedAt: revertedValue ? new Date().toISOString() : null,
        });
      } else {
        patchAndResortNote(id, { isFavorite: revertedValue });
      }
    },
    [patchAndResortNote],
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

  // Read via ref so this listener (like the Ctrl+N one above) is only ever attached once.
  // No-op while offline — editing itself is disabled then.
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey || !isOnlineRef.current) return;
      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        setPreview((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-0 flex-col notes:h-full">
      <OfflineBanner className="m-4 mb-0" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 notes:flex-row notes:overflow-visible">
        <Sidebar
          appName={appName}
          allNotesCount={allNotesCount}
          favoritesCount={favoritesCount}
          pinnedCount={pinnedCount}
          tags={tags}
          selectedTagId={selectedTagId}
          onTagSelect={setSelectedTagId}
          activeView={activeView}
          onViewSelect={setActiveView}
          onNewNote={handleNewNote}
          isCreatingNote={createNote.isPending}
        />
        <NoteList
          className="notes:flex-[2]"
          notes={notes}
          totalCount={totalCount}
          heading={activeView === "favorites" ? "Favorites" : activeView === "pinned" ? "Pinned" : "All Notes"}
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
            className="notes:flex-[3]"
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
            isFavorite={selectedNote.isFavorite}
            isPinned={selectedNote.isPinned}
            onToggleFieldOptimistic={(field, nextValue) =>
              handleToggleOptimistic(selectedNote.id, field, nextValue)
            }
            onToggleFieldError={(field, revertedValue) =>
              handleToggleError(selectedNote.id, field, revertedValue)
            }
            onDelete={handleDeleteSelectedNote}
            disabled={!isOnline}
            createdAt={selectedNote.createdAt}
            updatedAt={selectedNote.updatedAt}
          />
        )}
      </div>
    </div>
  );
}
