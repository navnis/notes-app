import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavRowProps {
  icon: ReactNode;
  label: string;
  count: number;
  active?: boolean;
  onClick: () => void;
}

/** A single Views row (All Notes/Trash) inside Sidebar — not meant to be used outside it. */
export function NavRow({ icon, label, count, active, onClick }: NavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50",
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className="rounded-full bg-accent-foreground/10 px-1.5 text-[10px] font-bold">
        {count}
      </span>
    </button>
  );
}
