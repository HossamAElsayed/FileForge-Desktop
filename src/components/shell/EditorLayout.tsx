import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CodeMirrorEditor } from "@/components/editor/CodeMirrorEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { WorkspacePanel } from "@/components/shell/WorkspacePanel";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { LayoutMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";
import { cn } from "@/lib/utils";

interface EditorLayoutProps {
  onError: (message: string) => void;
}

function SoloPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-1 flex-col">
      {children}
    </div>
  );
}

export function EditorLayout({ onError }: EditorLayoutProps) {
  const layoutMode = useSettingsStore((s) => s.layoutMode);
  const content = useDocumentStore((s) => s.content);
  const isConverting = useDocumentStore((s) => s.isConverting);
  const previewContent = useDebouncedValue(content, 100);
  const hasContent = content.trim().length > 0;

  const editor = (
    <WorkspacePanel variant="editor" layoutMode={layoutMode}>
      <CodeMirrorEditor disabled={isConverting} onError={onError} />
    </WorkspacePanel>
  );

  const preview = (
    <WorkspacePanel
      variant="preview"
      layoutMode={layoutMode}
      hasContent={hasContent}
    >
      <MarkdownPreview content={previewContent} layoutMode={layoutMode} />
    </WorkspacePanel>
  );

  return (
    <main
      key={layoutMode}
      data-layout-mode={layoutMode}
      className={cn(
        "editor-container min-h-0 min-w-0 flex-1",
        `layout-${layoutMode}`,
        "panel-enter",
      )}
    >
      {layoutMode === "focus" && <SoloPanel>{editor}</SoloPanel>}

      {layoutMode === "preview" && <SoloPanel>{preview}</SoloPanel>}

      {layoutMode === "split" && (
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={50} minSize={22} className="min-w-0">
            {editor}
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-border/60" />
          <ResizablePanel defaultSize={50} minSize={22} className="min-w-0">
            {preview}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </main>
  );
}

export type { LayoutMode };
