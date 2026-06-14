import { Group, Panel, Separator } from "react-resizable-panels";

import { CodeMirrorEditor } from "@/components/editor/CodeMirrorEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { LayoutMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";

interface EditorLayoutProps {
  onError: (message: string) => void;
}

export function EditorLayout({ onError }: EditorLayoutProps) {
  const layoutMode = useSettingsStore((s) => s.layoutMode);
  const content = useDocumentStore((s) => s.content);
  const isConverting = useDocumentStore((s) => s.isConverting);
  const previewContent = useDebouncedValue(content, 100);

  const editor = (
    <CodeMirrorEditor disabled={isConverting} onError={onError} />
  );

  const preview = <MarkdownPreview content={previewContent} />;

  if (layoutMode === "focus") {
    return (
      <div className="editor-container focus panel-enter">
        {editor}
      </div>
    );
  }

  if (layoutMode === "preview") {
    return (
      <div className="editor-container preview panel-enter">
        {preview}
      </div>
    );
  }

  return (
    <div className="editor-container split">
      <Group orientation="horizontal" className="h-full w-full">
        <Panel defaultSize={50} minSize={25}>
          {editor}
        </Panel>
        <Separator className="pane-divider w-px bg-border" />
        <Panel defaultSize={50} minSize={25}>
          {preview}
        </Panel>
      </Group>
    </div>
  );
}

export type { LayoutMode };
