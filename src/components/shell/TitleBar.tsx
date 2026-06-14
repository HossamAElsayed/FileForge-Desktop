import {
  Columns2Icon,
  DownloadIcon,
  EyeIcon,
  Loader2Icon,
  MonitorIcon,
  MoonIcon,
  PencilIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LayoutMode, ThemeMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";

interface TitleBarProps {
  onExport: () => void;
}

const LAYOUT_MODES: { value: LayoutMode; label: string; icon: React.ReactNode }[] = [
  { value: "split", label: "Split", icon: <Columns2Icon size={14} /> },
  { value: "focus", label: "Focus", icon: <PencilIcon size={14} /> },
  { value: "preview", label: "Preview", icon: <EyeIcon size={14} /> },
];

function themeIcon(mode: ThemeMode) {
  if (mode === "dark") return <MoonIcon size={14} />;
  if (mode === "light") return <SunIcon size={14} />;
  return <MonitorIcon size={14} />;
}

export function TitleBar({ onExport }: TitleBarProps) {
  const layoutMode = useSettingsStore((s) => s.layoutMode);
  const setLayoutMode = useSettingsStore((s) => s.setLayoutMode);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const cycleThemeMode = useSettingsStore((s) => s.cycleThemeMode);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

  const filename = useDocumentStore((s) => s.filename);
  const hasContent = useDocumentStore((s) => s.content.trim().length > 0);
  const isConverting = useDocumentStore((s) => s.isConverting);

  const handleMinimize = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  };

  const handleMaximize = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    if (await win.isMaximized()) {
      await win.unmaximize();
    } else {
      await win.maximize();
    }
  };

  const handleClose = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().hide();
  };

  return (
    <header className="titlebar" data-tauri-drag-region>
      <div className="titlebar-brand" data-tauri-drag-region>
        <div className="titlebar-spacer" />
        <img src="/tauri.svg" alt="" aria-hidden="true" />
        <span>FileForge</span>
      </div>

      <div className="titlebar-title" data-tauri-drag-region>
        {filename ?? "Untitled"}
      </div>

      <div className="titlebar-controls">
        <div className="layout-switcher">
          {LAYOUT_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              className={`tb-btn icon-only ${layoutMode === mode.value ? "active" : ""}`}
              title={mode.label}
              aria-label={mode.label}
              onClick={() => setLayoutMode(mode.value)}
            >
              {mode.icon}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="tb-btn"
          onClick={onExport}
          disabled={!hasContent || isConverting}
          title="Export to PDF (Ctrl+Shift+E)"
        >
          {isConverting ? (
            <Loader2Icon size={14} className="animate-spin" />
          ) : (
            <DownloadIcon size={14} />
          )}
          Export PDF
        </button>

        <button
          type="button"
          className="tb-btn icon-only"
          title={`Theme: ${themeMode}`}
          aria-label="Cycle theme"
          onClick={cycleThemeMode}
        >
          {themeIcon(themeMode)}
        </button>

        <button
          type="button"
          className="tb-btn icon-only"
          title="Settings (Ctrl+,)"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon size={14} />
        </button>

        <div className="window-controls">
          <button type="button" className="window-btn" onClick={handleMinimize} aria-label="Minimize">
            ─
          </button>
          <button type="button" className="window-btn" onClick={handleMaximize} aria-label="Maximize">
            ▢
          </button>
          <button type="button" className="window-btn close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
    </header>
  );
}

export function ExportMenu({ onExport }: { onExport: () => void }) {
  const hasContent = useDocumentStore((s) => s.content.trim().length > 0);
  const isConverting = useDocumentStore((s) => s.isConverting);

  return (
    <Button onClick={onExport} disabled={!hasContent || isConverting}>
      {isConverting ? "Exporting…" : "Export to PDF"}
    </Button>
  );
}
