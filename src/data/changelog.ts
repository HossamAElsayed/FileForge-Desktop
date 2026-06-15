export type ChangelogCategory = "new" | "improvements" | "fixes";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: Partial<Record<ChangelogCategory, string[]>>;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.1.1",
    date: "2026-03-14",
    title: "Initial public release",
    changes: {
      new: [
        "CodeMirror 6 markdown editor with syntax highlighting",
        "Live GFM preview with Prism code-block highlighting",
        "Split, Focus, and Preview layout modes",
        "Four color schemes (Default, GitHub, Nord, Dracula) with light, dark, and system themes",
        "Local PDF export via system Chrome or Edge — no cloud, no network",
        "Native file dialogs, app menu shortcuts, system tray, and window state persistence",
        "Auto-updater via GitHub Releases",
        ],
      improvements: [
        "Keyboard shortcut reference built into preferences",
        "Add support for Windows and macOS (Apple Silicon)",
      ],
    },
  },
];
