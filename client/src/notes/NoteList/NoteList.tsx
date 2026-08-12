import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input, NoteCard, Select } from "@/components";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "./types";
import { SORT_OPTIONS } from "./NoteList.constants";
import { filterAndSortNotes } from "./NoteList.utils";

export interface NoteListProps {
  notes: NoteListItem[];
  selectedNoteId?: string | null;
  onSelectNote: (id: string) => void;
  className?: string;
}

export function NoteList({ notes, selectedNoteId, onSelectNote, className }: NoteListProps) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const searchRef = useRef<HTMLInputElement>(null);

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

  const visibleNotes = useMemo(
    () => filterAndSortNotes(notes, query, sortBy),
    [notes, query, sortBy],
  );

  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col gap-4 p-4", className)}>
      <Input
        ref={searchRef}
        icon={<Search className="size-4" />}
        placeholder="Search titles, body, or tags... (Press '/' to focus)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search notes"
        className="border-transparent shadow-sm"
      />

      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          All Notes
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
            {notes.length}
          </span>
        </h2>
        <Select
          aria-label="Sort by"
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
          className="w-44"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {visibleNotes.map((note) => (
          <NoteCard
            key={note.id}
            emoji={note.emoji}
            title={note.title}
            preview={note.preview}
            tags={note.tags}
            updatedAt={note.updatedAt}
            selected={note.id === selectedNoteId}
            onClick={() => onSelectNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
