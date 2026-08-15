import { Command } from "lucide-react";
import { Modal } from "@/components";
import { SHORTCUTS } from "./ShortcutsModal.constants";

export interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard Shortcuts"
      titleIcon={<Command className="size-5" />}
      className="max-w-lg"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SHORTCUTS.map((shortcut) => (
          <div
            key={shortcut.label}
            className="flex items-center justify-between gap-3 rounded-lg bg-accent/50 px-3 py-2.5"
          >
            <span className="text-sm font-medium text-foreground">{shortcut.label}</span>
            <kbd className="rounded border border-border bg-card px-2 py-1 text-xs font-medium shadow-sm">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Press <kbd className="rounded border border-border bg-card px-1.5 py-0.5">Esc</kbd> anytime to close
        dialogs.
      </p>
    </Modal>
  );
}
