import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  APP_AUTHOR,
  APP_COPYRIGHT,
  APP_GITHUB_URL,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/app-metadata";
import { getAppVersion } from "@/lib/tauri/app-info";
import { useUpdateCheck } from "@/hooks/use-update-check";

interface AboutPanelProps {
  active: boolean;
}

function formatLastChecked(iso: string | null): string {
  if (!iso) return "Never checked";
  return `Last checked ${new Date(iso).toLocaleString()}`;
}

function updateStatusLine(
  isChecking: boolean,
  hasUpdate: boolean,
  nextVersion: string | null,
  status: string,
  lastChecked: string | null,
): string {
  if (isChecking) return "Checking for updates…";
  if (hasUpdate && nextVersion) return `Update available (v${nextVersion})`;
  if (status === "up_to_date") return "Up to date";
  return formatLastChecked(lastChecked);
}

export function AboutPanel({ active }: AboutPanelProps) {
  const [version, setVersion] = useState<string | null>(null);
  const {
    status,
    nextVersion,
    isChecking,
    hasUpdate,
    lastUpdateCheckAt,
    runCheck,
  } = useUpdateCheck();

  useEffect(() => {
    if (!active) return;
    getAppVersion()
      .then(setVersion)
      .catch(() => setVersion("unknown"));
  }, [active]);

  const statusLine = updateStatusLine(
    isChecking,
    hasUpdate,
    nextVersion,
    status,
    lastUpdateCheckAt,
  );

  return (
    <div className="flex w-full flex-col gap-3.5">
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/15 p-3.5">
        <img
          src="/logo.png"
          alt={APP_NAME}
          className="size-10 shrink-0 rounded-lg object-contain"
        />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-foreground">{APP_NAME}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border/60 bg-background px-3 py-2">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Version
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-foreground">
            {version ?? "…"}
          </p>
          <p
            className={`mt-1 text-[11px] ${
              hasUpdate ? "font-medium text-primary" : "text-muted-foreground"
            }`}
          >
            {statusLine}
          </p>
        </div>
        <div className="rounded-md border border-border/60 bg-background px-3 py-2">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Author
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-foreground">{APP_AUTHOR}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-background px-3 py-2">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Copyright
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-foreground">{APP_COPYRIGHT}</p>
        </div>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => openUrl(APP_GITHUB_URL)}
        >
          View on GitHub
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => void runCheck({ silent: false })}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2Icon className="animate-spin" />
              Checking…
            </>
          ) : (
            "Check for Updates"
          )}
        </Button>
      </div>
    </div>
  );
}
