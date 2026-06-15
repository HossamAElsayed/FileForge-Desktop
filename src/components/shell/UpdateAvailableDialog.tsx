import { Loader2Icon } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { useUpdateCheck } from "@/hooks/use-update-check";
import { useSettingsStore } from "@/stores/settings-store";

export function UpdateAvailableDialog() {
  const {
    dialogOpen,
    currentVersion,
    nextVersion,
    releaseNotes,
    downloadProgress,
    errorMessage,
    isDownloading,
    dismissDialog,
    installUpdate,
    runCheck,
  } = useUpdateCheck();

  const openPreferences = useSettingsStore((s) => s.openPreferences);

  const showProgress = isDownloading;
  const hasError = Boolean(errorMessage) && !isDownloading;

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open && !isDownloading) dismissDialog();
      }}
    >
      <DialogContent showCloseButton={!isDownloading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasError ? "Update failed" : "Update available"}
          </DialogTitle>
          <DialogDescription>
            {hasError ? (
              errorMessage
            ) : nextVersion && currentVersion ? (
              <>
                A new version of FileForge is ready to install.
                <span className="mt-2 block font-medium text-foreground">
                  v{currentVersion} → v{nextVersion}
                </span>
              </>
            ) : (
              "A new version of FileForge is ready to install."
            )}
          </DialogDescription>
        </DialogHeader>

        {!hasError && releaseNotes ? (
          <div className="max-h-32 overflow-y-auto rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {releaseNotes}
          </div>
        ) : null}

        {showProgress ? (
          <Progress value={downloadProgress ?? undefined}>
            <ProgressLabel>Downloading update</ProgressLabel>
            <ProgressValue>
              {downloadProgress !== null ? `${downloadProgress}%` : "…"}
            </ProgressValue>
          </Progress>
        ) : null}

        {hasError ? (
          <Alert variant="destructive" className="text-sm">
            {errorMessage}
          </Alert>
        ) : null}

        <DialogFooter className="sm:justify-between">
          {!hasError ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mr-auto"
              disabled={isDownloading}
              onClick={() => openPreferences("changelog")}
            >
              What's New
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            {hasError ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => dismissDialog()}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void runCheck({ silent: false })}
                >
                  Retry
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDownloading}
                  onClick={() => dismissDialog()}
                >
                  Not now
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isDownloading}
                  onClick={() => void installUpdate()}
                >
                  {isDownloading ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Installing…
                    </>
                  ) : (
                    "Install now"
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
