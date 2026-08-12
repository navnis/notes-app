import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, Loader2, Pencil, Tag as TagIcon, Trash2 } from "lucide-react";
import type { Note, Tag as TagData } from "@notes/shared";
import { cn } from "@/lib/utils";
import { Button, MarkdownEditor, Modal, Tag, toast } from "@/components";
import { useUpdateNote } from "@/hooks/useNotes";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "./NoteEditor.utils";
import { AUTOSAVE_DEBOUNCE_MS } from "./NoteEditor.constants";

type SaveStatus = "saved" | "saving" | "error";

export interface NoteEditorProps {
  /** The note currently being edited — autosave calls `PUT /api/notes/:id` against this. */
  noteId: string;
  /** Optional leading emoji shown before the title, e.g. "🚀". */
  emoji?: string;
  title: string;
  onTitleChange: (title: string) => void;
  value: string;
  onChange: (value: string) => void;
  preview: boolean;
  onPreviewChange: (preview: boolean) => void;
  /** Fired after a successful autosave with the server's copy of the note (fresh `updatedAt`, etc). */
  onSaved?: (note: Note) => void;
  onDelete: () => void;
  tags: Pick<TagData, "id" | "name">[];
  onAddTag: (name: string) => void;
  onRemoveTag: (id: string) => void;
  createdAt: string | Date;
  updatedAt: string | Date;
  className?: string;
}

export function NoteEditor({
  noteId,
  emoji,
  title,
  onTitleChange,
  value,
  onChange,
  preview,
  onPreviewChange,
  onSaved,
  onDelete,
  tags,
  onAddTag,
  onRemoveTag,
  createdAt,
  updatedAt,
  className,
}: NoteEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const updateNote = useUpdateNote();
  // Skips the very next autosave — set whenever `noteId` changes (switching
  // to a note, including the initial mount) so loading a note's existing
  // title/content isn't mistaken for a user edit.
  const skipNextSave = useRef(true);

  useEffect(() => {
    skipNextSave.current = true;
    setSaveStatus("saved");
  }, [noteId]);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    setSaveStatus("saving");
    const timeout = setTimeout(() => {
      updateNote.mutate(
        { id: noteId, input: { title, content: value } },
        {
          onSuccess: (note) => {
            setSaveStatus("saved");
            onSaved?.(note);
          },
          onError: (error) => {
            setSaveStatus("error");
            toast.error(error instanceof ApiError ? error.message : "Couldn't save your changes.");
          },
        },
      );
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // Only the edited fields should re-trigger the debounce timer — noteId
    // switches are handled by the effect above, and updateNote/onSaved are
    // stable enough in practice not to matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, value]);

  const handleAddTag = () => {
    const name = newTag.trim();
    if (!name) return;
    if (tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`"${name}" is already tagged on this note`);
      setNewTag("");
      return;
    }
    onAddTag(name);
    setNewTag("");
  };

  const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const updatedDate = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col gap-4 rounded-lg bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => onPreviewChange(false)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                !preview ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onPreviewChange(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                preview ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye className="size-3.5" />
              Preview
            </button>
          </div>
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              <CheckCircle2 className="size-3.5" />
              Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              <AlertCircle className="size-3.5" />
              Failed to save
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete note"
          onClick={() => setConfirmingDelete(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {emoji && (
          <span className="text-2xl" aria-hidden="true">
            {emoji}
          </span>
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Note"
          aria-label="Note title"
          className="w-full flex-1 appearance-none bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <TagIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="scrollbar-thin flex min-w-0 items-center gap-2 overflow-x-auto">
          {tags.map((tag) => (
            <Tag key={tag.id} onRemove={() => onRemoveTag(tag.id)} className="shrink-0">
              #{tag.name}
            </Tag>
          ))}
        </div>
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTag();
          }}
          placeholder="+ Add tag (Press Enter)"
          aria-label="Add tag"
          className="w-40 shrink-0 appearance-none rounded-full border border-primary/30 bg-transparent px-2.5 py-1 text-xs text-muted-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <MarkdownEditor
        aria-label="Note content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        preview={preview}
        className="flex-1"
      />

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Created: {formatDateTime(createdDate)}</span>
        <span>Updated: {formatDateTime(updatedDate)}</span>
      </div>

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Delete note?"
        description="This can't be undone."
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete();
        }}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
