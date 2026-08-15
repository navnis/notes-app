import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";

export interface OfflineBannerProps {
  className?: string;
}

// Purely presentational for now — actual offline queueing/sync is a later piece of work.
export function OfflineBanner({ className }: OfflineBannerProps) {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  // Re-arm the dismissal so the banner reappears on the next time the connection actually drops.
  useEffect(() => {
    if (isOnline) setDismissed(false);
  }, [isOnline]);

  if (isOnline || dismissed) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-red-600 backdrop-blur-sm dark:bg-destructive/15 dark:text-red-400",
        className,
      )}
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      <span>Offline Mode Detected — Editing is paused. Changes aren't saved while offline.</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-1 shrink-0 cursor-pointer underline underline-offset-2 hover:text-red-800 dark:hover:text-red-300"
      >
        Dismiss
      </button>
    </div>
  );
}
