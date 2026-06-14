import { useCallback, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { toast, Toaster } from "sonner";

import { EditorLayout } from "@/components/shell/EditorLayout";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { StatusBar } from "@/components/shell/StatusBar";
import { TitleBar } from "@/components/shell/TitleBar";
import { exportMarkdownToPdf, checkForUpdates } from "@/lib/tauri/export";
import { openMarkdownFile } from "@/lib/tauri/open-file";
import { validateContentSize } from "@/lib/file-upload";
import { applyTheme } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";

function useThemeEffect() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const lineHeight = useSettingsStore((s) => s.lineHeight);

  useEffect(() => {
    applyTheme(colorScheme, themeMode);
    document.documentElement.style.setProperty("--editor-font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("--editor-line-height", String(lineHeight));
  }, [colorScheme, themeMode, fontSize, lineHeight]);

  useEffect(() => {
    if (themeMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(colorScheme, "system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [colorScheme, themeMode]);
}

function useMenuShortcuts(
  onOpen: () => void,
  onExport: () => void,
  onSettings: () => void,
) {
  const setLayoutMode = useSettingsStore((s) => s.setLayoutMode);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        onOpen();
      }
      if (event.ctrlKey && event.shiftKey && event.key === "E") {
        event.preventDefault();
        onExport();
      }
      if (event.ctrlKey && event.key === ",") {
        event.preventDefault();
        onSettings();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen, onExport, onSettings]);

  useEffect(() => {
    const unlisten = listen<string>("menu-action", (event) => {
      switch (event.payload) {
        case "open":
          onOpen();
          break;
        case "export_pdf":
          onExport();
          break;
        case "settings":
          setSettingsOpen(true);
          break;
        case "check_updates":
          checkForUpdates()
            .then(() => toast.success("You're up to date"))
            .catch(() => toast.message("No updates available"));
          break;
        case "layout_split":
          setLayoutMode("split");
          break;
        case "layout_focus":
          setLayoutMode("focus");
          break;
        case "layout_preview":
          setLayoutMode("preview");
          break;
        default:
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [onOpen, onExport, setLayoutMode, setSettingsOpen]);
}

export default function App() {
  useThemeEffect();

  const setContent = useDocumentStore((s) => s.setContent);
  const content = useDocumentStore((s) => s.content);
  const filename = useDocumentStore((s) => s.filename);
  const setConverting = useDocumentStore((s) => s.setConverting);
  const setConvertProgress = useDocumentStore((s) => s.setConvertProgress);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);

  const handleError = useCallback((message: string) => {
    toast.error("Error", { description: message });
  }, []);

  const handleOpen = useCallback(async () => {
    try {
      const result = await openMarkdownFile();
      if (result) {
        setContent(result.content, { filename: result.filename, dirty: false });
        toast.success("File opened", { description: result.filename });
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : "Failed to open file");
    }
  }, [setContent, handleError]);

  const handleExport = useCallback(async () => {
    if (!content.trim()) return;
    if (!validateContentSize(content, handleError)) return;

    setConverting(true);
    setConvertProgress(15, "Preparing your document…");

    try {
      setConvertProgress(40, "Converting markdown to PDF…");
      const { outputName, path } = await exportMarkdownToPdf(content, filename);
      setConvertProgress(100, "Export complete.");
      toast.success("PDF ready", {
        description: `${outputName} saved to ${path}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed";
      if (message !== "Export cancelled") {
        handleError(message);
      }
    } finally {
      setConverting(false);
      setTimeout(() => setConvertProgress(0, ""), 1500);
    }
  }, [
    content,
    filename,
    setConverting,
    setConvertProgress,
    handleError,
  ]);

  useMenuShortcuts(handleOpen, handleExport, () => setSettingsOpen(true));

  return (
    <div className="app-shell">
      <TitleBar onExport={handleExport} />
      <EditorLayout onError={handleError} />
      <StatusBar />
      <SettingsDialog />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
