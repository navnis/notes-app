import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavRowProps {
  icon: ReactNode;
  label: string;
  count: number;
  active?: boolean;
  /** Renders as a static row instead of a button when omitted. */
  onClick?: () => void;
}

/** A single Views row (currently just All Notes) inside Sidebar — not meant to be used outside it. */
export function NavRow({ icon, label, count, active, onClick }: NavRowProps) {
  const className = cn(
    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
    active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50",
    onClick && "cursor-pointer",
  );
  const content = (
    <>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className="rounded-full bg-accent-foreground/10 px-1.5 text-[10px] font-bold">
        {count}
      </span>
    </>
  );

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
