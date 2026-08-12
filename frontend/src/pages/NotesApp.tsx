import { useState } from "react";
import { Tag } from "@/components";

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [selectedTag, setSelectedTag] = useState<string | null>("work");
  const [editorTags, setEditorTags] = useState(["draft", "personal"]);

  const tags = [
    { name: "work", count: 4 },
    { name: "recipes", count: 2 },
    { name: "personal", count: 1 },
  ];

  return (
    <div className="p-8 flex flex-col gap-6 items-start">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Read-only (note card)</p>
        <div className="flex gap-2">
          <Tag>#work</Tag>
          <Tag>#recipes</Tag>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Filter chips with usage counts (sidebar)</p>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <Tag
              key={tag.name}
              count={tag.count}
              selected={selectedTag === tag.name}
              onClick={() =>
                setSelectedTag((current) => (current === tag.name ? null : tag.name))
              }
            >
              #{tag.name}
            </Tag>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Removable (note editor)</p>
        <div className="flex gap-2">
          {editorTags.length === 0 && (
            <p className="text-xs text-muted-foreground">No tags left.</p>
          )}
          {editorTags.map((tag) => (
            <Tag
              key={tag}
              onRemove={() =>
                setEditorTags((current) => current.filter((t) => t !== tag))
              }
            >
              #{tag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
