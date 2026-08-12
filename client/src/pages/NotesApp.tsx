import { useState } from "react";
import { Sidebar, NoteList, NoteEditor } from "@/notes";

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

const INITIAL_NOTES = [
  {
    id: "1",
    emoji: "🚀",
    title: "Frontend Fundamentals & System Design",
    preview:
      "Frontend Architecture Guidelines When building modern web applications, state management and ...",
    content:
      "# Frontend Architecture Guidelines\n\nWhen building modern web applications, state management and data flow are paramount.\n\n- **Optimistic UI Updates**: Instantly reflect actions while syncing API calls.\n- **Debounced Input**: Prevent excessive search query requests.\n- **Accessibility**: Support keyboard shortcuts (`Ctrl+N`, `/`) and semantic HTML structure.",
    tags: [SAMPLE_TAGS[0], SAMPLE_TAGS[1], SAMPLE_TAGS[2]],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "2",
    emoji: "⚡",
    title: "Backend API Spec & SQLite Schema",
    preview: "REST API Endpoints Required | Method | Endpoint | Description | ... | GET | /notes | Support...",
    content: "# REST API Endpoints\n\nRequired endpoints:\n\n- `GET /notes`\n- `POST /notes`\n- `DELETE /notes/:id`",
    tags: [SAMPLE_TAGS[3], SAMPLE_TAGS[4], SAMPLE_TAGS[5]],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "3",
    emoji: "💡",
    title: "Product Roadmap & UX Polish",
    preview: "UX Roadmap Checklist [x] Responsive layout for mobile & desktop [x] Keyboard shortcuts moda...",
    content: "# UX Roadmap Checklist\n\n- [x] Responsive layout for mobile & desktop\n- [x] Keyboard shortcuts modal",
    tags: [SAMPLE_TAGS[6], SAMPLE_TAGS[7]],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [activeView, setActiveView] = useState<"notes" | "trash">("notes");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>("1");
  const [preview, setPreview] = useState(false);

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 sm:flex-row">
      <Sidebar
        allNotesCount={notes.length}
        trashCount={0}
        activeView={activeView}
        onViewChange={setActiveView}
        tags={SAMPLE_TAGS}
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        onNewNote={() => console.log("new note")}
      />
      <NoteList
        className="flex-[2]"
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
      />
      {selectedNote && (
        <NoteEditor
          className="flex-[3]"
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
              prev.map((note) => (note.id === selectedNote.id ? { ...note, content: value } : note)),
            )
          }
          preview={preview}
          onPreviewChange={setPreview}
          saved
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
          onDelete={() => {
            setNotes((prev) => prev.filter((note) => note.id !== selectedNote.id));
            setSelectedNoteId(null);
          }}
          createdAt={selectedNote.createdAt}
          updatedAt={selectedNote.updatedAt}
        />
      )}
    </div>
  );
}
