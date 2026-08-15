import { memo, useState } from "react";
import { BookOpen, FileText, Keyboard, Pin, Plus, Star } from "lucide-react";
import type { NoteView, Tag as TagData } from "@notes/shared";
import { cn } from "@/lib/utils";
import { Button, Tag } from "@/components";
import { LogoutButton } from "@/auth";
import { NavRow } from "./NavRow";
import { ShortcutsModal } from "../ShortcutsModal";

export interface SidebarProps {
  /** Defaults to "Notes" — pass your own app name/branding. */
  appName?: string;
  allNotesCount: number;
  favoritesCount: number;
  pinnedCount: number;
  tags: TagData[];
  selectedTagId?: string | null;
  onTagSelect?: (id: string | null) => void;
  /** null/undefined means "All Notes" (no view filter) — combinable with a tag/search filter. */
  activeView?: NoteView | null;
  onViewSelect?: (view: NoteView | null) => void;
  onNewNote: () => void;
  isCreatingNote?: boolean;
  className?: string;
}

export const Sidebar = memo(function Sidebar({
  appName = "Notes",
  allNotesCount,
  favoritesCount,
  pinnedCount,
  tags,
  selectedTagId,
  onTagSelect,
  activeView,
  onViewSelect,
  onNewNote,
  isCreatingNote,
  className,
}: SidebarProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <aside
      className={cn(
        "flex w-full flex-col gap-6 rounded-lg bg-card p-4 shadow-sm notes:h-full notes:w-72",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BookOpen className="size-5" />
        </span>
        <p className="text-base font-bold text-foreground">{appName}</p>
      </div>

      <Button
        onClick={onNewNote}
        icon={<Plus className="size-4" />}
        loading={isCreatingNote}
        className="w-full"
      >
        <span className="flex-1 text-left">New Note</span>
        {!isCreatingNote && (
          <kbd className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium">
            Ctrl+N
          </kbd>
        )}
      </Button>

      <div className="flex flex-col gap-1">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Views
        </p>
        <NavRow
          icon={<FileText className="size-4" />}
          label="All Notes"
          count={allNotesCount}
          active={!activeView}
          onClick={() => onViewSelect?.(null)}
        />
        <NavRow
          icon={<Star className="size-4" />}
          label="Favorites"
          count={favoritesCount}
          active={activeView === "favorites"}
          onClick={() => onViewSelect?.(activeView === "favorites" ? null : "favorites")}
        />
        <NavRow
          icon={<Pin className="size-4" />}
          label="Pinned"
          count={pinnedCount}
          active={activeView === "pinned"}
          onClick={() => onViewSelect?.(activeView === "pinned" ? null : "pinned")}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tags
        </p>
        {tags.length === 0 ? (
          <p className="px-2 text-sm text-muted-foreground">No tags yet.</p>
        ) : (
          <div className="scrollbar-thin flex min-h-0 flex-wrap content-start gap-1.5 overflow-y-auto px-2">
            {tags.map((tag) => (
              <Tag
                key={tag.id}
                count={tag.count}
                selected={tag.id === selectedTagId}
                onClick={() => onTagSelect?.(tag.id === selectedTagId ? null : tag.id)}
              >
                #{tag.name}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShortcutsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground cursor-pointer hover:bg-accent/80"
      >
        <Keyboard className="size-4" />
        Shortcuts
      </button>

      <div className="border-t border-border pt-3">
        <LogoutButton />
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
