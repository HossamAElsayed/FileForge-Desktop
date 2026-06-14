import { EyeIcon, PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { LayoutMode } from "@/themes";

interface PreviewEmptyStateProps {
  layoutMode: LayoutMode;
}

const HINTS: Record<LayoutMode, string[]> = {
  split: ["Type to update", "Split view", "Ctrl+O to open"],
  focus: ["Switch to split view", "Ctrl+O to open"],
  preview: ["Open a file", "Use split to edit", "Ctrl+O"],
};

const DESCRIPTIONS: Record<LayoutMode, string> = {
  split:
    "Start writing in the editor — your rendered markdown will appear here in real time.",
  focus:
    "You're in focus mode. Switch to split view to see a live preview beside the editor.",
  preview:
    "Preview-only mode. Open a markdown file or switch to split view to edit and preview together.",
};

export function PreviewEmptyState({ layoutMode }: PreviewEmptyStateProps) {
  const hints = HINTS[layoutMode];

  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_center,var(--accent-subtle)_0%,transparent_72%)] p-6 sm:p-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
        <div className="relative flex size-12 items-center justify-center rounded-xl bg-card/70 ring-1 ring-border shadow-sm">
          <EyeIcon className="size-5 text-muted-foreground" />
          {layoutMode === "split" && (
            <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-md bg-background ring-1 ring-border">
              <PencilIcon className="size-2.5 text-muted-foreground" />
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-medium text-foreground">Live preview</h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {DESCRIPTIONS[layoutMode]}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {hints.map((hint) => (
            <Badge key={hint} variant="outline" className="text-[11px]">
              {hint}
            </Badge>
          ))}
        </div>

        <div className="flex w-full max-w-[220px] flex-col gap-2 opacity-35">
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="h-2 w-4/5 rounded-full bg-muted" />
          <div className="h-2 w-3/5 rounded-full bg-muted" />
          <div className="h-2 w-2/3 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
