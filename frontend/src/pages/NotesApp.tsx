import { Plus, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components";

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  return (
    <div className="p-8 flex flex-col gap-4 items-start">
      <Button icon={<Plus className="size-4" />}>New note</Button>
      <Button variant="ghost" icon={<Pin className="size-4" />}>
        Ghost with icon
      </Button>
      <Button variant="danger">Delete note</Button>
      <Button loading>Loading</Button>
      <Button
        variant="ghost"
        size="icon"
        icon={<Pin className="size-4" />}
        aria-label="Pin note"
      />
      <Button
        variant="ghost"
        size="icon"
        icon={<Trash2 className="size-4" />}
        aria-label="Delete note"
      />
      <Button disabled>Disabled</Button>
    </div>
  );
}
