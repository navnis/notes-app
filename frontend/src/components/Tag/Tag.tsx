import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tagVariants } from "./Tag.variants";

export interface TagProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Usage count shown as a trailing badge (e.g. from GET /tags). */
  count?: number;
  /** Solid vs soft background — only meaningful when onClick makes this a filter toggle. */
  selected?: boolean;
  /** Renders the whole tag as a button (e.g. tag filter chips). */
  onClick?: () => void;
  /** Adds a small ✕ button that calls this (e.g. removing a tag from a note). */
  onRemove?: () => void;
  /** aria-label for the remove button. Defaults to "Remove {children}". */
  removeLabel?: string;
}

export function Tag({
  children,
  count,
  selected,
  onClick,
  onRemove,
  removeLabel,
  className,
  ...props
}: TagProps) {
  const classes = cn(tagVariants({ selected }), onClick && "cursor-pointer", className);

  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.();
  };

  const content = (
    <>
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 text-[10px] font-bold",
            selected ? "bg-primary-foreground/20" : "bg-accent-foreground/10",
          )}
        >
          {count}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          aria-label={removeLabel ?? `Remove ${typeof children === "string" ? children : "tag"}`}
          className="cursor-pointer hover:text-destructive"
        >
          <X className="size-3" />
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} {...props}>
        {content}
      </button>
    );
  }

  return (
    <span className={classes} {...props}>
      {content}
    </span>
  );
}
