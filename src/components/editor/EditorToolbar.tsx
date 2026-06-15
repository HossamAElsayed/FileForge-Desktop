/* EditorToolbar has been merged into ActivityToolbar.tsx as a vertical sidebar.
   This file exists only to prevent import resolution errors from EditorLayout.
   All formatting actions live in the vertical ActivityToolbar sidebar now. */

import { useSettingsStore } from "@/stores/settings-store";

export function EditorToolbar() {
  const layoutMode = useSettingsStore((s) => s.layoutMode);
  if (layoutMode === "preview") return null;
  return null;
}
