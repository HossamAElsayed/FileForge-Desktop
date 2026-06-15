import { ArrowDownToLineIcon, Loader2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUpdateCheck } from "@/hooks/use-update-check";
import { cn } from "@/lib/utils";

export function UpdateDownloadBar() {
  const { isDownloading, downloadProgress } = useUpdateCheck();

  if (!isDownloading) return null;

  return (
    <Progress
      value={downloadProgress}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 gap-0",
        "**:data-[slot=progress-track]:h-0.5 **:data-[slot=progress-track]:rounded-none",
        "**:data-[slot=progress-track]:bg-primary/20",
        "**:data-[slot=progress-indicator]:rounded-none",
        "**:data-[slot=progress-indicator]:bg-primary",
        "**:data-[slot=progress-indicator]:shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_55%,transparent)]",
      )}
    />
  );
}

export function UpdateDownloadStatus() {
  const { isDownloading, downloadProgress, nextVersion, currentVersion } =
    useUpdateCheck();

  if (!isDownloading) return null;

  const percentLabel =
    downloadProgress !== null ? `${downloadProgress}%` : "…";

  return (
    <div
      className="pointer-events-none flex max-w-[min(100%,20rem)] min-w-0 items-center gap-2 rounded-md border border-primary/25 bg-primary/8 px-2.5 py-1 shadow-sm ring-1 ring-primary/10"
      role="status"
      aria-live="polite"
      aria-label={
        nextVersion
          ? `Downloading update to version ${nextVersion}, ${percentLabel}`
          : `Downloading update, ${percentLabel}`
      }
    >
      <Badge
        variant="secondary"
        className="h-5 shrink-0 gap-1 border-primary/20 bg-primary/15 px-1.5 text-[10px] text-primary"
      >
        <Loader2Icon className="animate-spin" data-icon="inline-start" />
        Update
      </Badge>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 truncate text-xs font-medium text-foreground">
            <ArrowDownToLineIcon className="size-3 shrink-0 text-primary" />
            <span className="truncate">
              {nextVersion ? (
                <>
                  {currentVersion ? (
                    <span className="text-muted-foreground">
                      v{currentVersion}
                    </span>
                  ) : null}
                  {currentVersion ? (
                    <span className="mx-1 text-muted-foreground/70">→</span>
                  ) : null}
                  <span>v{nextVersion}</span>
                </>
              ) : (
                "Downloading…"
              )}
            </span>
          </span>
          <span className="shrink-0 text-xs font-medium tabular-nums text-primary">
            {percentLabel}
          </span>
        </div>

        <Progress
          value={downloadProgress}
          className={cn(
            "gap-0",
            "**:data-[slot=progress-track]:h-1",
            "**:data-[slot=progress-track]:bg-primary/15",
            "**:data-[slot=progress-indicator]:bg-primary",
          )}
        />
      </div>
    </div>
  );
}
