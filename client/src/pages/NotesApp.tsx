import { useState } from "react";
import { Button, MarkdownEditor } from "@/components";

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [value, setValue] = useState(
    "# Hello\n\nSome **markdown** with a list:\n\n- one\n- two",
  );
  const [preview, setPreview] = useState(false);

  return (
    <div className="p-8 max-w-lg flex flex-col gap-2">
      {/* Stand-in for the real Edit/Preview tabs the note page will own. */}
      <div className="flex gap-1">
        <Button
          type="button"
          variant={preview ? "ghost" : "primary"}
          onClick={() => setPreview(false)}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant={preview ? "primary" : "ghost"}
          onClick={() => setPreview(true)}
        >
          Preview
        </Button>
      </div>
      <MarkdownEditor
        label="Note"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        preview={preview}
      />
    </div>
  );
}
