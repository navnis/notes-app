import { memo } from "react";
import { BookOpen, FileText, Plus, Trash2 } from "lucide-react";
import type { Tag as TagData } from "@notes/shared";
import { cn } from "@/lib/utils";
import { Button, Tag } from "@/components";
import { LogoutButton } from "@/auth";
import { NavRow } from "./NavRow";

export interface SidebarProps {
  /** Defaults to "Notes" — pass your own app name/branding. */
  appName?: string;
  allNotesCount: number;
  trashCount: number;
  activeView: "notes" | "trash";
  onViewChange: (view: "notes" | "trash") => void;
  tags: TagData[];
  selectedTagId?: string | null;
  onTagSelect?: (id: string | null) => void;
  onNewNote: () => void;
  className?: string;
}

export const Sidebar = memo(function Sidebar({
  appName = "Notes",
  allNotesCount,
  trashCount,
  activeView,
  onViewChange,
  tags,
  selectedTagId,
  onTagSelect,
  onNewNote,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-full flex-col gap-6 rounded-lg bg-card p-4 shadow-sm sm:h-full sm:w-72",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BookOpen className="size-5" />
        </span>
        <p className="text-base font-bold text-foreground">{appName}</p>
      </div>

      <Button onClick={onNewNote} icon={<Plus className="size-4" />} className="w-full">
        <span className="flex-1 text-left">New Note</span>
        <kbd className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium">
          ⌘N
        </kbd>
      </Button>

      <div className="flex flex-col gap-1">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Views
        </p>
        <NavRow
          icon={<FileText className="size-4" />}
          label="All Notes"
          count={allNotesCount}
          active={activeView === "notes"}
          onClick={() => onViewChange("notes")}
        />
        <NavRow
          icon={<Trash2 className="size-4" />}
          label="Trash"
          count={trashCount}
          active={activeView === "trash"}
          onClick={() => onViewChange("trash")}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tags
        </p>
        <div className="flex flex-wrap gap-1.5 overflow-y-auto px-2">
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
      </div>

      <div className="border-t border-border pt-3">
        <LogoutButton />
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
