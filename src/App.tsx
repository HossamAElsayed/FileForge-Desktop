import { useCallback, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreferencesDialog } from "@/components/settings/PreferencesDialog";
import { ActivityToolbar } from "@/components/shell/ActivityToolbar";
import { EditorLayout } from "@/components/shell/EditorLayout";
import { RenameDocumentDialog } from "@/components/shell/RenameDocumentDialog";
import { StatusBar } from "@/components/shell/StatusBar";
import { TitleBar } from "@/components/shell/TitleBar";
import {
  UnsavedChangesDialog,
  type DiscardAction,
} from "@/components/shell/UnsavedChangesDialog";
import {
  exportMarkdownToPdf,
  checkForUpdates,
  handleUpdateCheckResult,
} from "@/lib/tauri/export";
import { openFilePath, showFileInFolder } from "@/lib/tauri/open-path";
import { openMarkdownFile } from "@/lib/tauri/open-file";
import { renameMarkdownFile } from "@/lib/tauri/rename-file";
import {
  saveMarkdownFileAs,
  saveOrSaveAs,
} from "@/lib/tauri/save-file";
import { APP_NAME } from "@/lib/app-metadata";
import { isModKey } from "@/lib/keyboard";
import { SAMPLE_MARKDOWN } from "@/lib/constants";
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

function useWindowTitle(filename: string | null, isDirty: boolean) {
  useEffect(() => {
    const syncTitle = async () => {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const name = filename ?? "Untitled";
      const prefix = isDirty ? "* " : "";
      await getCurrentWindow().setTitle(`${prefix}${name} — ${APP_NAME}`);
    };
    syncTitle();
  }, [filename, isDirty]);
}

function useMenuShortcuts(handlers: {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onRename: () => void;
  onLoadSample: () => void;
  onExport: () => void;
  onOpenPreferences: (tab?: "general" | "about" | "changelog" | "shortcuts") => void;
  onCheckUpdates: () => void;
}) {
  const setLayoutMode = useSettingsStore((s) => s.setLayoutMode);
  const openPreferences = useSettingsStore((s) => s.openPreferences);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isModKey(event) && event.key === "n") {
        event.preventDefault();
        handlers.onNew();
      }
      if (isModKey(event) && event.key === "o") {
        event.preventDefault();
        handlers.onOpen();
      }
      if (isModKey(event) && event.key === "s") {
        event.preventDefault();
        if (event.shiftKey) {
          handlers.onSaveAs();
        } else {
          handlers.onSave();
        }
      }
      if (event.key === "F2") {
        event.preventDefault();
        handlers.onRename();
      }
      if (isModKey(event) && event.shiftKey && event.key === "E") {
        event.preventDefault();
        handlers.onExport();
      }
      if (isModKey(event) && event.key === ",") {
        event.preventDefault();
        handlers.onOpenPreferences("general");
      }
      if (isModKey(event) && event.key === "1") {
        event.preventDefault();
        setLayoutMode("split");
      }
      if (isModKey(event) && event.key === "2") {
        event.preventDefault();
        setLayoutMode("focus");
      }
      if (isModKey(event) && event.key === "3") {
        event.preventDefault();
        setLayoutMode("preview");
      }
      if (event.key === "F1") {
        event.preventDefault();
        handlers.onOpenPreferences("shortcuts");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlers, setLayoutMode]);

  useEffect(() => {
    let unlistenApp: (() => void) | undefined;
    let unlistenWindow: (() => void) | undefined;

    const handleMenuAction = (id: string) => {
      switch (id) {
        case "new":
          handlers.onNew();
          break;
        case "open":
          handlers.onOpen();
          break;
        case "load_sample":
          handlers.onLoadSample();
          break;
        case "save":
          handlers.onSave();
          break;
        case "save_as":
          handlers.onSaveAs();
          break;
        case "export_pdf":
          handlers.onExport();
          break;
        case "about":
          openPreferences("about");
          break;
        case "whats_new":
          openPreferences("changelog");
          break;
        case "keyboard_shortcuts":
          openPreferences("shortcuts");
          break;
        case "settings":
          openPreferences("general");
          break;
        case "check_updates":
          handlers.onCheckUpdates();
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
    };

    const setup = async () => {
      unlistenApp = await listen<string>("menu-action", (event) => {
        handleMenuAction(event.payload);
      });

      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      unlistenWindow = await getCurrentWindow().listen<string>(
        "menu-action",
        (event) => {
          handleMenuAction(event.payload);
        },
      );
    };

    setup();

    return () => {
      unlistenApp?.();
      unlistenWindow?.();
    };
  }, [handlers, setLayoutMode, openPreferences]);
}

export default function App() {
  useThemeEffect();

  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [pendingDiscard, setPendingDiscard] = useState<DiscardAction | null>(
    null,
  );

  const openDocument = useDocumentStore((s) => s.openDocument);
  const setFilename = useDocumentStore((s) => s.setFilename);
  const setFilePath = useDocumentStore((s) => s.setFilePath);
  const markClean = useDocumentStore((s) => s.markClean);
  const content = useDocumentStore((s) => s.content);
  const filename = useDocumentStore((s) => s.filename);
  const filePath = useDocumentStore((s) => s.filePath);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const newDocument = useDocumentStore((s) => s.newDocument);
  const setConverting = useDocumentStore((s) => s.setConverting);
  const setConvertProgress = useDocumentStore((s) => s.setConvertProgress);
  const openPreferences = useSettingsStore((s) => s.openPreferences);

  useWindowTitle(filename, isDirty);

  const handleError = useCallback((message: string) => {
    toast.error("Error", { description: message });
  }, []);

  const hideWindow = useCallback(async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().hide();
  }, []);

  const applySavedDocument = useCallback(
    (path: string, savedFilename: string) => {
      setFilePath(path);
      setFilename(savedFilename);
      markClean();
    },
    [setFilePath, setFilename, markClean],
  );

  const performSave = useCallback(async (): Promise<boolean> => {
    if (!content.trim()) {
      handleError("Nothing to save.");
      return false;
    }
    if (!validateContentSize(content, handleError)) return false;

    try {
      const result = await saveOrSaveAs(content, filePath, filename);
      applySavedDocument(result.path, result.filename);
      toast.success("File saved", { description: result.filename });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save file";
      if (message !== "Save cancelled") {
        handleError(message);
      }
      return false;
    }
  }, [content, filePath, filename, applySavedDocument, handleError]);

  const performSaveAs = useCallback(async (): Promise<boolean> => {
    if (!content.trim()) {
      handleError("Nothing to save.");
      return false;
    }
    if (!validateContentSize(content, handleError)) return false;

    try {
      const result = await saveMarkdownFileAs(content, filename);
      applySavedDocument(result.path, result.filename);
      toast.success("File saved", { description: result.filename });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save file";
      if (message !== "Save cancelled") {
        handleError(message);
      }
      return false;
    }
  }, [content, filename, applySavedDocument, handleError]);

  const performOpen = useCallback(async () => {
    try {
      const result = await openMarkdownFile();
      if (result) {
        openDocument({
          content: result.content,
          filename: result.filename,
          filePath: result.filePath,
        });
        useDocumentStore.getState().requestEditorFocus();
        toast.success("File opened", { description: result.filename });
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : "Failed to open file");
    }
  }, [openDocument, handleError]);

  const performLoadSample = useCallback(() => {
    openDocument({
      content: SAMPLE_MARKDOWN,
      filename: "sample.md",
      filePath: null,
    });
    useDocumentStore.getState().requestEditorFocus();
    toast.success("Sample loaded", { description: "sample.md" });
  }, [openDocument]);

  const performNewDocument = useCallback(() => {
    newDocument();
    setUnsavedDialogOpen(false);
    setPendingDiscard(null);
  }, [newDocument]);

  const runPendingDiscard = useCallback(async () => {
    const action = pendingDiscard;
    setUnsavedDialogOpen(false);
    setPendingDiscard(null);

    switch (action) {
      case "new":
        performNewDocument();
        break;
      case "open":
        await performOpen();
        break;
      case "sample":
        performLoadSample();
        break;
      case "close":
        await hideWindow();
        break;
      default:
        break;
    }
  }, [
    pendingDiscard,
    performNewDocument,
    performOpen,
    performLoadSample,
    hideWindow,
  ]);

  const withDiscardGuard = useCallback(
    (action: DiscardAction, run: () => void | Promise<void>) => {
      if (isDirty) {
        setPendingDiscard(action);
        setUnsavedDialogOpen(true);
        return;
      }
      void run();
    },
    [isDirty],
  );

  const handleSave = useCallback(() => {
    void performSave();
  }, [performSave]);

  const handleSaveAs = useCallback(() => {
    void performSaveAs();
  }, [performSaveAs]);

  const handleRename = useCallback(
    async (newFilename: string) => {
      setRenameDialogOpen(false);

      if (filePath) {
        try {
          const result = await renameMarkdownFile(filePath, newFilename);
          setFilePath(result.path);
          setFilename(result.filename);
          toast.success("File renamed", { description: result.filename });
        } catch (error) {
          handleError(
            error instanceof Error ? error.message : "Failed to rename file",
          );
        }
        return;
      }

      setFilename(newFilename);
      toast.success("Document renamed", { description: newFilename });
    },
    [filePath, setFilePath, setFilename, handleError],
  );

  const handleUnsavedSave = useCallback(async () => {
    const saved = await performSave();
    if (!saved) return;
    await runPendingDiscard();
  }, [performSave, runPendingDiscard]);

  const handleNew = useCallback(() => {
    withDiscardGuard("new", performNewDocument);
  }, [withDiscardGuard, performNewDocument]);

  const handleOpen = useCallback(() => {
    withDiscardGuard("open", performOpen);
  }, [withDiscardGuard, performOpen]);

  const handleLoadSample = useCallback(() => {
    withDiscardGuard("sample", performLoadSample);
  }, [withDiscardGuard, performLoadSample]);

  const handleClose = useCallback(() => {
    withDiscardGuard("close", hideWindow);
  }, [withDiscardGuard, hideWindow]);

  const handleCheckUpdates = useCallback(async () => {
    const result = await checkForUpdates();
    handleUpdateCheckResult(result);
  }, []);

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
        action: {
          label: "Open PDF",
          onClick: () => {
            openFilePath(path).catch((error) =>
              handleError(
                error instanceof Error ? error.message : "Failed to open PDF",
              ),
            );
          },
        },
        cancel: {
          label: "Show in folder",
          onClick: () => {
            showFileInFolder(path).catch((error) =>
              handleError(
                error instanceof Error
                  ? error.message
                  : "Failed to open folder",
              ),
            );
          },
        },
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

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    const unlisten = listen("window-close-requested", () => {
      handleCloseRef.current();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useMenuShortcuts({
    onNew: handleNew,
    onOpen: handleOpen,
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onRename: () => setRenameDialogOpen(true),
    onLoadSample: handleLoadSample,
    onExport: handleExport,
    onOpenPreferences: openPreferences,
    onCheckUpdates: handleCheckUpdates,
  });

  return (
    <TooltipProvider delay={400}>
      <div className="app-shell">
        <TitleBar
          onSave={handleSave}
          onExport={handleExport}
          onRename={() => setRenameDialogOpen(true)}
          onClose={handleClose}
          onOpenPreferences={openPreferences}
          onCheckUpdates={handleCheckUpdates}
        />
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <ActivityToolbar
            onNew={handleNew}
            onOpen={handleOpen}
            onSave={handleSave}
            onLoadSample={handleLoadSample}
          />
          <EditorLayout onError={handleError} />
        </div>
        <StatusBar />
        <PreferencesDialog />
        <UnsavedChangesDialog
          open={unsavedDialogOpen}
          action={pendingDiscard ?? "new"}
          onSave={handleUnsavedSave}
          onConfirm={runPendingDiscard}
          onCancel={() => {
            setUnsavedDialogOpen(false);
            setPendingDiscard(null);
          }}
        />
        <RenameDocumentDialog
          open={renameDialogOpen}
          filename={filename}
          filePath={filePath}
          onConfirm={handleRename}
          onCancel={() => setRenameDialogOpen(false)}
        />
        <Toaster richColors position="bottom-right" closeButton />
      </div>
    </TooltipProvider>
  );
}
