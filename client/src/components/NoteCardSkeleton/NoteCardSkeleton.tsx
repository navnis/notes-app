import { cn } from "@/lib/utils";

export interface NoteCardSkeletonProps {
  className?: string;
}

// Mirrors NoteCard's shape (border, padding, rounding) so the loading and loaded states don't jump.
export function NoteCardSkeleton({ className }: NoteCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading note"
      className={cn(
        "flex w-full animate-pulse flex-col gap-2 rounded-xl border-2 border-transparent bg-card p-4",
        className,
      )}
    >
      <div className="h-4 w-3/4 rounded-full bg-muted" />
      <div className="h-3 w-full rounded-full bg-muted" />
      <div className="h-3 w-2/3 rounded-full bg-muted" />
    </div>
  );
}
