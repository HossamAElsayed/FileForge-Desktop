import { Columns2Icon, EyeIcon, PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress, ProgressValue } from "@/components/ui/progress";
import { useDocumentStats } from "@/hooks/use-document-stats";
import type { LayoutMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useDocumentStore } from "@/stores/document-store";

const LAYOUT_LABELS: Record<
  LayoutMode,
  { label: string; icon: typeof Columns2Icon }
> = {
  split: { label: "Split", icon: Columns2Icon },
  focus: { label: "Focus", icon: PencilIcon },
  preview: { label: "Preview", icon: EyeIcon },
};

export function StatusBar() {
  const content = useDocumentStore((s) => s.content);
  const filename = useDocumentStore((s) => s.filename);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const isConverting = useDocumentStore((s) => s.isConverting);
  const convertProgress = useDocumentStore((s) => s.convertProgress);
  const statusMessage = useDocumentStore((s) => s.statusMessage);
  const layoutMode = useSettingsStore((s) => s.layoutMode);

  const { words, characters, readingTimeMinutes } = useDocumentStats(content);
  const hasContent = content.trim().length > 0;
  const layout = LAYOUT_LABELS[layoutMode];
  const LayoutIcon = layout.icon;

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/30 px-3 text-xs text-muted-foreground">
      <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
        {hasContent ? (
          <>
            {isDirty && (
              <>
                <span
                  className="size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                <span className="shrink-0 text-primary">Unsaved</span>
                <span className="shrink-0">·</span>
              </>
            )}
            <strong className="truncate font-medium text-foreground">
              {filename ?? "Untitled"}
            </strong>
            <span className="hidden shrink-0 sm:inline">·</span>
            <span className="hidden shrink-0 sm:inline">
              {words.toLocaleString()} words
            </span>
            <span className="hidden shrink-0 md:inline">·</span>
            <span className="hidden shrink-0 md:inline">
              {characters.toLocaleString()} chars
            </span>
            <span className="hidden shrink-0 lg:inline">·</span>
            <span className="hidden shrink-0 lg:inline">
              {readingTimeMinutes} min read
            </span>
          </>
        ) : (
          <span className="truncate">
            Start typing, or press Ctrl+O to open a file
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge
          variant="outline"
          className="h-5 gap-1 px-1.5 text-[10px] font-normal text-muted-foreground"
        >
          <LayoutIcon className="size-3" />
          {layout.label}
        </Badge>

        <div
          className="hidden min-w-0 max-w-[200px] items-center gap-2 sm:flex"
          aria-live="polite"
        >
          {isConverting ? (
            <>
              <span className="truncate">{statusMessage}</span>
              <Progress value={convertProgress} className="w-20 gap-0">
                <ProgressValue />
              </Progress>
            </>
          ) : (
            <span className="truncate">Processed locally</span>
          )}
        </div>
      </div>
    </footer>
  );
}
