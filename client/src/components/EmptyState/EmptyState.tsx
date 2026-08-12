import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center rounded-2xl bg-card p-8 text-center shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent text-primary shadow-inner">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-bold text-foreground">{title}</h3>
      {description && <p className="mb-4 max-w-xs text-xs text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button size="default" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
