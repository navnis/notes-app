import { memo, useEffect, useRef, useState } from "react";
import { FileText, Loader2, Search, SearchX } from "lucide-react";
import { EmptyState, Input, NoteCard, NoteCardSkeleton, Select } from "@/components";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "./types";
import { SEARCH_DEBOUNCE_MS, SKELETON_COUNT, SORT_OPTIONS } from "./NoteList.constants";

export interface NoteListProps {
  notes: NoteListItem[];
  /** Total matching the current filters, from the server — not just notes.length (only the loaded page). */
  totalCount: number;
  /** Defaults to "All Notes" — pass the active view's label (e.g. "Favorites", "Pinned") when one is selected. */
  heading?: string;
  /** True while the current filters' results are (re)loading — scoped to just this column, not the whole page. */
  isLoading?: boolean;
  selectedNoteId?: string | null;
  onSelectNote: (id: string) => void;
  /** Shown as the empty-state's action when there are no notes at all. */
  onCreateNote?: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export const NoteList = memo(function NoteList({
  notes,
  totalCount,
  heading = "All Notes",
  isLoading,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  hasMore,
  isFetchingMore,
  onLoadMore,
  className,
}: NoteListProps) {
  // Local, un-debounced value the input itself is bound to — onSearchChange
  // (which triggers a server request) only fires after the user pauses.
  const [queryInput, setQueryInput] = useState(search);
  const searchRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Global "/" shortcut focuses search, unless the user is already typing somewhere else.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (event.key !== "/" || isTyping) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => onSearchChange(queryInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // Only the input's own value should re-trigger the debounce timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  // Fetches the next page once the sentinel at the bottom of the list scrolls into view.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore();
      },
      { root: sentinel.parentElement },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  const handleClearSearch = () => {
    setQueryInput("");
    onSearchChange("");
  };

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-col gap-4 p-4 notes:h-full", className)}>
      <Input
        ref={searchRef}
        icon={<Search className="size-4" />}
        placeholder="Search titles, body, or tags... (Press '/' to focus)"
        value={queryInput}
        onChange={(e) => setQueryInput(e.target.value)}
        aria-label="Search notes"
        className="border-transparent shadow-sm"
      />

      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          {heading}
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
            {totalCount}
          </span>
        </h2>
        <Select
          aria-label="Sort by"
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={onSortByChange}
          className="w-44"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <NoteCardSkeleton key={index} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        totalCount === 0 && !search ? (
          <EmptyState
            icon={<FileText className="size-7" />}
            title="No notes yet"
            description="Create your first note to get started."
            actionLabel="+ New Note"
            onAction={onCreateNote}
          />
        ) : (
          <EmptyState
            icon={<SearchX className="size-7" />}
            title="No notes match your search"
            description="Try a different search term to see more notes."
            actionLabel="Clear search"
            onAction={handleClearSearch}
          />
        )
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              emoji={note.emoji}
              title={note.title}
              preview={note.preview}
              tags={note.tags}
              isFavorite={note.isFavorite}
              isPinned={note.isPinned}
              updatedAt={note.updatedAt}
              selected={note.id === selectedNoteId}
              onClick={onSelectNote}
            />
          ))}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-2">
              {isFetchingMore && (
                <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading more notes" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

NoteList.displayName = "NoteList";
