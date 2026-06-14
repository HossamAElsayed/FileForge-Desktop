import { useCallback, useEffect, useState } from "react";
import {
  Columns2Icon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  Loader2Icon,
  MinusIcon,
  MonitorIcon,
  MoonIcon,
  PencilIcon,
  SettingsIcon,
  SquareIcon,
  SunIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HelpMenu } from "@/components/shell/HelpMenu";
import { MOD_LABEL } from "@/lib/keyboard";
import type { LayoutMode, ThemeMode } from "@/themes";
import {
  useSettingsStore,
  type PreferencesTab,
} from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";

interface TitleBarProps {
  onExport: () => void;
  onClose: () => void;
  onOpenPreferences: (tab?: PreferencesTab) => void;
  onCheckUpdates: () => void;
}

const LAYOUT_MODES: {
  value: LayoutMode;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}[] = [
  { value: "split", label: "Split", shortcut: `${MOD_LABEL}+1`, icon: <Columns2Icon /> },
  { value: "focus", label: "Focus", shortcut: `${MOD_LABEL}+2`, icon: <PencilIcon /> },
  { value: "preview", label: "Preview", shortcut: `${MOD_LABEL}+3`, icon: <EyeIcon /> },
];

function themeIcon(mode: ThemeMode) {
  if (mode === "dark") return <MoonIcon />;
  if (mode === "light") return <SunIcon />;
  return <MonitorIcon />;
}

export function TitleBar({
  onExport,
  onClose,
  onOpenPreferences,
  onCheckUpdates,
}: TitleBarProps) {
  const layoutMode = useSettingsStore((s) => s.layoutMode);
  const setLayoutMode = useSettingsStore((s) => s.setLayoutMode);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const cycleThemeMode = useSettingsStore((s) => s.cycleThemeMode);

  const filename = useDocumentStore((s) => s.filename);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const hasContent = useDocumentStore((s) => s.content.trim().length > 0);
  const isConverting = useDocumentStore((s) => s.isConverting);

  const [isMaximized, setIsMaximized] = useState(false);

  const syncMaximized = useCallback(async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    setIsMaximized(await getCurrentWindow().isMaximized());
  }, []);

  useEffect(() => {
    syncMaximized();
  }, [syncMaximized]);

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
    await syncMaximized();
  };

  const displayName = `${isDirty ? "* " : ""}${filename ?? "Untitled"}`;

  return (
    <header
      className="relative z-20 grid h-[38px] shrink-0 grid-cols-[auto_1fr_auto] items-center border-b border-border bg-background/80 px-3 backdrop-blur-md select-none"
      data-tauri-drag-region
    >
      <div className="flex min-w-0 items-center gap-2" data-tauri-drag-region>
        <div className="titlebar-spacer" />
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-0.5 transition-colors hover:bg-accent/10"
          title="About FileForge"
          aria-label="About FileForge"
          onClick={() => onOpenPreferences("about")}
        >
          <img
            src="/logo.png"
            alt="FileForge"
            className="size-[18px] rounded object-contain"
          />
          <span className="text-[0.8125rem] font-semibold text-foreground">
            FileForge
          </span>
        </button>
      </div>

      <div
        className="pointer-events-none truncate text-center text-[0.8125rem] font-medium text-muted-foreground"
        data-tauri-drag-region
      >
        {displayName}
      </div>

      <div className="flex items-center justify-end gap-0.5">
        <ToggleGroup
          value={[layoutMode]}
          onValueChange={(next) => {
            const selected = next[0] as LayoutMode | undefined;
            if (
              selected === "split" ||
              selected === "focus" ||
              selected === "preview"
            ) {
              setLayoutMode(selected);
            }
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Editor layout"
        >
          {LAYOUT_MODES.map((mode) => (
            <ToggleGroupItem
              key={mode.value}
              value={mode.value}
              aria-label={mode.label}
              title={`${mode.label} (${mode.shortcut})`}
            >
              {mode.icon}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Button
          variant="default"
          size="sm"
          onClick={onExport}
          disabled={!hasContent || isConverting}
          title={`Export to PDF (${MOD_LABEL}+Shift+E)`}
          className="ml-1"
        >
          {isConverting ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <DownloadIcon />
          )}
          Export PDF
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          title={`Theme: ${themeMode}`}
          aria-label="Cycle theme"
          onClick={cycleThemeMode}
        >
          {themeIcon(themeMode)}
        </Button>

        <HelpMenu
          onOpenPreferences={onOpenPreferences}
          onCheckUpdates={onCheckUpdates}
        />

        <Button
          variant="ghost"
          size="icon-sm"
          title={`Settings (${MOD_LABEL}+,)`}
          aria-label="Settings"
          onClick={() => onOpenPreferences("general")}
        >
          <SettingsIcon />
        </Button>

        <div className="ml-2 flex items-center gap-px">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <MinusIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleMaximize}
            aria-label={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <CopyIcon /> : <SquareIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <XIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
