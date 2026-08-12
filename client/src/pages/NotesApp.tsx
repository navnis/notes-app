import { useState } from "react";
import { Sidebar } from "@/notes";

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

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [activeView, setActiveView] = useState<"notes" | "trash">("notes");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col sm:flex-row">
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
      <main className="flex-1 p-8 text-muted-foreground">Main content area</main>
    </div>
  );
}
