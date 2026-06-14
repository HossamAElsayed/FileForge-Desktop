import { useEffect, useRef } from "react";
import { FileUpIcon } from "lucide-react";

import { createMarkdownEditor } from "@/components/editor/codemirror-setup";
import { Button } from "@/components/ui/button";
import { SAMPLE_MARKDOWN } from "@/lib/constants";
import { validateAndReadFile } from "@/lib/file-upload";
import { resolveThemeMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";

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

  const content = useDocumentStore((s) => s.content);
  const setContent = useDocumentStore((s) => s.setContent);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const lineHeight = useSettingsStore((s) => s.lineHeight);

  const hasContent = content.trim().length > 0;

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
      onChange: (value) => setContent(value, { dirty: true }),
      readOnly: disabled,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
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

  const handleFile = (file: File) => {
    validateAndReadFile(
      file,
      (fileContent, filename) => setContent(fileContent, { filename, dirty: false }),
      onError,
    );
  };

  if (!hasContent) {
    return (
      <div className="empty-editor">
        <button
          type="button"
          className="dropzone"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".md,.markdown,.txt";
            input.onchange = () => {
              const file = input.files?.[0];
              if (file) handleFile(file);
            };
            input.click();
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("dragging");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("dragging");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("dragging");
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <FileUpIcon size={28} />
          <h3>Drop your markdown file here, or click to browse</h3>
          <p>Supports .md, .markdown, .txt up to 5 MB</p>
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setContent(SAMPLE_MARKDOWN, { filename: "sample.md", dirty: false })
          }
        >
          Load Sample
        </Button>
      </div>
    );
  }

  return (
    <div
      className="editor-pane panel-enter"
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepthRef.current += 1;
      }}
      onDragLeave={() => {
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepthRef.current = 0;
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
