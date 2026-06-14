import { MOD_LABEL } from "@/lib/keyboard";

export interface ShortcutEntry {
  keys: string;
  action: string;
}

export interface ShortcutGroup {
  label: string;
  shortcuts: ShortcutEntry[];
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: "File",
    shortcuts: [
      { keys: `${MOD_LABEL}+N`, action: "New document" },
      { keys: `${MOD_LABEL}+O`, action: "Open file" },
      { keys: `${MOD_LABEL}+S`, action: "Save" },
      { keys: `${MOD_LABEL}+Shift+S`, action: "Save As" },
      { keys: "F2", action: "Rename document" },
      { keys: `${MOD_LABEL}+Shift+E`, action: "Export to PDF" },
    ],
  },
  {
    label: "View",
    shortcuts: [
      { keys: `${MOD_LABEL}+1`, action: "Split view" },
      { keys: `${MOD_LABEL}+2`, action: "Focus mode" },
      { keys: `${MOD_LABEL}+3`, action: "Preview only" },
    ],
  },
  {
    label: "Editor",
    shortcuts: [
      { keys: `${MOD_LABEL}+Z`, action: "Undo" },
      { keys: `${MOD_LABEL}+Shift+Z`, action: "Redo" },
      { keys: `${MOD_LABEL}+B`, action: "Bold" },
      { keys: `${MOD_LABEL}+I`, action: "Italic" },
    ],
  },
  {
    label: "App",
    shortcuts: [
      { keys: `${MOD_LABEL}+,`, action: "Settings" },
      { keys: "F1", action: "Keyboard shortcuts" },
    ],
  },
];
