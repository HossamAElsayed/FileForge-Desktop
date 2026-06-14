import { useEffect, useRef, useState } from "react";

import { createMarkdownEditor } from "@/components/editor/codemirror-setup";
import { validateAndReadFile } from "@/lib/file-upload";
import { resolveThemeMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";
import { useEditorStore } from "@/stores/editor-store";
import { cn } from "@/lib/utils";

interface CodeMirrorEditorProps {
  disabled?: boolean;
  onError: (message: string) => void;
}

export function CodeMirrorEditor({ disabled, onError }: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<ReturnType<typeof createMarkdownEditor.create> | null>(
    null,
  );
  const dragDepthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const content = useDocumentStore((s) => s.content);
  const editorFocusToken = useDocumentStore((s) => s.editorFocusToken);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const lineHeight = useSettingsStore((s) => s.lineHeight);
  const setView = useEditorStore((s) => s.setView);

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return;

    viewRef.current = createMarkdownEditor.create({
      parent: containerRef.current,
      initialDoc: content,
      theme: {
        dark: resolveThemeMode(themeMode) === "dark",
        fontSize,
        lineHeight,
      },
      onChange: (value) => {
        const { filename, setContent } = useDocumentStore.getState();
        if (!filename && value.length > 0) {
          setContent(value, { filename: "Untitled.md", dirty: true });
        } else {
          setContent(value, { dirty: true });
        }
      },
      readOnly: disabled,
    });

    viewRef.current.focus();
    setView(viewRef.current);

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
      setView(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;
    createMarkdownEditor.reconfigureTheme(viewRef.current, {
      dark: resolveThemeMode(themeMode) === "dark",
      fontSize,
      lineHeight,
    });
  }, [themeMode, fontSize, lineHeight]);

  useEffect(() => {
    if (!viewRef.current) return;
    createMarkdownEditor.reconfigureReadOnly(viewRef.current, !!disabled);
  }, [disabled]);

  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== content) {
      createMarkdownEditor.setDocument(viewRef.current, content);
    }
  }, [content]);

  useEffect(() => {
    if (!viewRef.current || editorFocusToken === 0) return;
    viewRef.current.focus();
  }, [editorFocusToken]);

  const handleFile = (file: File) => {
    validateAndReadFile(
      file,
      (fileContent, filename) =>
        useDocumentStore.getState().openDocument({
          content: fileContent,
          filename,
          filePath: null,
        }),
      onError,
    );
  };

  return (
    <div
      className={cn(
        "editor-pane relative h-full w-full",
        isDragging && "ring-2 ring-inset ring-primary/60",
      )}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault();
        if (disabled) return;
        dragDepthRef.current += 1;
        setIsDragging(true);
      }}
      onDragLeave={() => {
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepthRef.current = 0;
        setIsDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-primary/5 text-sm font-medium text-primary">
          Drop to open file
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
