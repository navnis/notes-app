import { useState } from "react";
import { Sidebar, NoteList } from "@/notes";

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

const SAMPLE_NOTES = [
  {
    id: "1",
    emoji: "🚀",
    title: "Frontend Fundamentals & System Design",
    preview:
      "Frontend Architecture Guidelines When building modern web applications, state management and ...",
    tags: [SAMPLE_TAGS[0], SAMPLE_TAGS[1], SAMPLE_TAGS[2]],
    updatedAt: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "2",
    emoji: "⚡",
    title: "Backend API Spec & SQLite Schema",
    preview: "REST API Endpoints Required | Method | Endpoint | Description | ... | GET | /notes | Support...",
    tags: [SAMPLE_TAGS[3], SAMPLE_TAGS[4], SAMPLE_TAGS[5]],
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "3",
    emoji: "💡",
    title: "Product Roadmap & UX Polish",
    preview: "UX Roadmap Checklist [x] Responsive layout for mobile & desktop [x] Keyboard shortcuts moda...",
    tags: [SAMPLE_TAGS[6], SAMPLE_TAGS[7]],
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [activeView, setActiveView] = useState<"notes" | "trash">("notes");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState("1");

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:flex-row">
      <Sidebar
        allNotesCount={3}
        trashCount={0}
        activeView={activeView}
        onViewChange={setActiveView}
        tags={SAMPLE_TAGS}
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        onNewNote={() => console.log("new note")}
      />
      <NoteList
        className="flex-1"
        notes={SAMPLE_NOTES}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
      />
    </div>
  );
}
