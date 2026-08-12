import { Loading } from "@/components";

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  return (
    <div className="p-8 flex flex-col gap-4 items-start">
      <Loading size="sm" label="Saving..." />
      <Loading size="md" label="Loading notes..." />
      <Loading size="lg" />
    </div>
  );
}
