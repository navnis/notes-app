import { useEffect, useState } from "react";
import type { Tag as TagData } from "@notes/shared";
import { Sidebar, NoteList, NoteEditor } from "@/notes";
import { Loading, toast } from "@/components";
import { useNotes, useCreateNote, useDeleteNote } from "@/hooks/useNotes";
import { ApiError } from "@/lib/api";
import { toPreviewText } from "./NotesApp.utils";

const SAMPLE_TAGS = [
  { id: "1", name: "architecture", count: 1 },
  { id: "2", name: "javascript", count: 1 },
  { id: "3", name: "frontend", count: 1 },
  { id: "4", name: "api", count: 1 },
  { id: "5", name: "backend", count: 1 },
  { id: "6", name: "db", count: 1 },
  { id: "7", name: "roadmap", count: 1 },
  { id: "8", name: "design", count: 1 },
];

interface NoteItem {
  id: string;
  emoji?: string;
  title: string;
  preview?: string;
  content: string;
  tags: Pick<TagData, "id" | "name">[];
  createdAt: string;
  updatedAt: string;
}

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const { data: fetchedNotes, isLoading, isError } = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  useEffect(() => {
    if (!fetchedNotes) return;
    setNotes((prev) =>
      fetchedNotes.map((note) => {
        // The selected note may have local edits the debounced autosave
        // hasn't caught up to yet — a background refetch (e.g. window
        // refocus) shouldn't clobber those with a possibly-older server copy.
        if (note.id === selectedNoteId) {
          const existing = prev.find((prevNote) => prevNote.id === note.id);
          if (existing) return existing;
        }
        return { ...note, emoji: "📝", preview: toPreviewText(note.content), tags: [] };
      }),
    );
    // Only the fetch result should re-run this merge — selectedNoteId is read,
    // not reacted to, so switching notes doesn't re-trigger a merge itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedNotes]);

  useEffect(() => {
    if (isError) toast.error("Couldn't load your notes. Please try again.");
  }, [isError]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  async function handleNewNote() {
    try {
      const note = await createNote.mutateAsync({ title: "Untitled Note", content: "" });
      setNotes((prev) => [
        { ...note, emoji: "📝", preview: toPreviewText(note.content), tags: [] },
        ...prev,
      ]);
      setSelectedNoteId(note.id);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Couldn't create the note. Please try again.";
      toast.error(message);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await deleteNote.mutateAsync(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
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
        allNotesCount={notes.length}
        tags={SAMPLE_TAGS}
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        onNewNote={handleNewNote}
      />
      <NoteList
        className="flex-[2]"
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={handleNewNote}
      />
      {selectedNote && (
        <NoteEditor
          className="flex-[3]"
          noteId={selectedNote.id}
          emoji={selectedNote.emoji}
          title={selectedNote.title}
          onTitleChange={(title) =>
            setNotes((prev) =>
              prev.map((note) => (note.id === selectedNote.id ? { ...note, title } : note)),
            )
          }
          value={selectedNote.content}
          onChange={(value) =>
            setNotes((prev) =>
              prev.map((note) =>
                note.id === selectedNote.id
                  ? { ...note, content: value, preview: toPreviewText(value) }
                  : note,
              ),
            )
          }
          preview={preview}
          onPreviewChange={setPreview}
          onSaved={(saved) =>
            setNotes((prev) =>
              prev.map((note) =>
                note.id === saved.id ? { ...note, updatedAt: saved.updatedAt } : note,
              ),
            )
          }
          tags={selectedNote.tags}
          onAddTag={(name) =>
            setNotes((prev) =>
              prev.map((note) =>
                note.id === selectedNote.id
                  ? { ...note, tags: [...note.tags, { id: crypto.randomUUID(), name, count: 1 }] }
                  : note,
              ),
            )
          }
          onRemoveTag={(id) =>
            setNotes((prev) =>
              prev.map((note) =>
                note.id === selectedNote.id
                  ? { ...note, tags: note.tags.filter((tag) => tag.id !== id) }
                  : note,
              ),
            )
          }
          onDelete={() => handleDeleteNote(selectedNote.id)}
          createdAt={selectedNote.createdAt}
          updatedAt={selectedNote.updatedAt}
        />
      )}
    </div>
  );
}
