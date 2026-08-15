export interface ShortcutEntry {
  label: string;
  keys: string;
}

export const SHORTCUTS: ShortcutEntry[] = [
  { label: "Create New Note", keys: "Ctrl+N" },
  { label: "Focus Search", keys: "/" },
  { label: "Toggle Preview", keys: "Ctrl+P" },
];
