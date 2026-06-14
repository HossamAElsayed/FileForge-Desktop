import type { ReactNode } from "react";
import { EyeIcon, PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { LayoutMode } from "@/themes";
import { cn } from "@/lib/utils";

interface WorkspacePanelProps {
  variant: "editor" | "preview";
  layoutMode: LayoutMode;
  hasContent?: boolean;
  children: ReactNode;
}

const PANEL_META = {
  editor: {
    icon: PencilIcon,
    label: "Editor",
    hint: "Markdown source",
  },
  preview: {
    icon: EyeIcon,
    label: "Preview",
    hint: "Rendered output",
  },
} as const;

export function WorkspacePanel({
  variant,
  layoutMode,
  hasContent = false,
  children,
}: WorkspacePanelProps) {
  const meta = PANEL_META[variant];
  const Icon = meta.icon;

  return (
    <div
      data-panel={variant}
      data-layout={layoutMode}
      className={cn(
        "flex h-full w-full min-h-0 flex-col overflow-hidden",
        variant === "editor" ? "bg-[var(--editor-bg)]" : "bg-[var(--preview-bg)]",
      )}
    >
      <header className="flex h-7 shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-background/40 px-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-[11px] font-medium tracking-wide text-foreground">
            {meta.label}
          </span>
          {layoutMode !== "split" && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
              {layoutMode === "focus" ? "Focus" : "Preview only"}
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden truncate text-[10px] text-muted-foreground sm:inline">
            {meta.hint}
          </span>
          {variant === "preview" && hasContent && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-primary/80"
              title="Live"
              aria-label="Preview is live"
            />
          )}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
