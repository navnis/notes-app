import { Button, toast } from "@/components";

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  return (
    <div className="p-8 flex gap-2 items-start">
      <Button onClick={() => toast.success("Note deleted")}>Trigger success toast</Button>
      <Button variant="danger" onClick={() => toast.error("Failed to save note")}>
        Trigger error toast
      </Button>
    </div>
  );
}
