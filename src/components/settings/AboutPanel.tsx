import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

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
import { checkForUpdates, handleUpdateCheckResult } from "@/lib/tauri/export";

interface AboutPanelProps {
  active: boolean;
}

export function AboutPanel({ active }: AboutPanelProps) {
  const [version, setVersion] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!active) return;
    getAppVersion()
      .then(setVersion)
      .catch(() => setVersion("0.1.0"));
  }, [active]);

  const handleCheckUpdates = async () => {
    setChecking(true);
    try {
      const result = await checkForUpdates();
      handleUpdateCheckResult(result);
    } catch (error) {
      toast.error("Update check failed", {
        description:
          error instanceof Error ? error.message : "Could not check for updates",
      });
    } finally {
      setChecking(false);
    }
  };

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
          onClick={handleCheckUpdates}
          disabled={checking}
        >
          {checking ? (
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
