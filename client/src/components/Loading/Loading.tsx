import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingProps {
  /** Shown as visible text next to the spinner. Always used as the aria-label too, even if omitted (falls back to "Loading"). */
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

export function Loading({ label, size = "md", className }: LoadingProps) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("flex items-center gap-2 text-muted-foreground", className)}
    >
      <Loader2 className={cn(sizeClasses[size], "animate-spin")} aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
