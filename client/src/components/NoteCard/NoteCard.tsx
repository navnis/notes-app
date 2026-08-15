import { memo } from "react";
import { Pin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components";
import { formatRelativeTime, VISIBLE_TAG_COUNT } from "./NoteCard.utils";

export interface NoteCardProps {
  id: string;
  /** Optional leading emoji, e.g. "🚀". */
  emoji?: string;
  title: string;
  /** Short snippet of the note's content, truncated to two lines. */
  preview?: string;
  tags: string[];
  /** Display-only — pin/favorite can only be toggled from NoteEditor, not from the card. */
  isFavorite?: boolean;
  isPinned?: boolean;
  /** Accepts a raw ISO string (as stored/returned by the API) or a Date. */
  updatedAt: string | Date;
  /** Highlights the card as the currently-open note. */
  selected?: boolean;
  /** Called with this card's id — lets the parent pass a stable callback instead of a per-card closure. */
  onClick?: (id: string) => void;
  className?: string;
}

export const NoteCard = memo(function NoteCard({
  id,
  emoji,
  title,
  preview,
  tags,
  isFavorite,
  isPinned,
  updatedAt,
  selected,
  onClick,
  className,
}: NoteCardProps) {
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const hiddenCount = tags.length - visibleTags.length;
  const date = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;

  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border-2 bg-card p-4 text-left shadow-sm transition-shadow cursor-pointer",
        selected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:shadow-md",
        className,
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-1.5 font-semibold text-foreground">
          {emoji && <span aria-hidden="true">{emoji}</span>}
          <span className="truncate">{title}</span>
        </h3>
        {(isPinned || isFavorite) && (
          <div className="flex shrink-0 items-center gap-1">
            {isPinned && (
              <Pin className="size-3.5 text-primary" fill="currentColor" role="img" aria-label="Pinned" />
            )}
            {isFavorite && (
              <Star
                className="size-3.5 text-amber-500"
                fill="currentColor"
                role="img"
                aria-label="Favorited"
              />
            )}
          </div>
        )}
      </div>

      {preview && <p className="line-clamp-2 text-sm text-muted-foreground">{preview}</p>}

      <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {visibleTags.map((tag) => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
          {hiddenCount > 0 && (
            <span className="text-xs text-muted-foreground">+{hiddenCount}</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(date)}</span>
      </div>
    </button>
  );
});

NoteCard.displayName = "NoteCard";
