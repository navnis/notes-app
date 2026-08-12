import { memo } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastItem } from "./types";

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
};

// Toasts keep a stable object reference across store updates (see
// toastStore's [...toasts, next]), so memo skips re-rendering existing
// toasts whenever the list changes elsewhere (one added/dismissed).
export const Toast = memo(function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = icons[toast.variant];

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className={cn(
        "flex max-w-sm items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-lg",
        toast.variant === "error" ? "border-destructive/50" : "border-border",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          toast.variant === "error" ? "text-destructive" : "text-primary",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 line-clamp-2">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
});

Toast.displayName = "Toast";
