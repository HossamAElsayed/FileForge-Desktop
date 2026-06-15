import type { DownloadEvent, Update } from "@tauri-apps/plugin-updater";

import { getAppVersion } from "@/lib/tauri/app-info";

export type UpdateCheckResult =
  | {
      status: "available";
      currentVersion: string;
      nextVersion: string;
      body?: string;
    }
  | { status: "up_to_date"; version: string }
  | { status: "error"; message: string };

export type DownloadProgressHandler = (percent: number | null) => void;

let pendingUpdate: Update | null = null;

const UNSIGNED_BUILD_HINT =
  "Updates are only available in signed release builds. Download the latest installer from GitHub Releases.";

function friendlyUpdateError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Could not check for updates";

  if (
    /signature|pubkey|not found|404|network|fetch|updater/i.test(message) &&
    import.meta.env.DEV
  ) {
    return UNSIGNED_BUILD_HINT;
  }

  if (/signature|pubkey|verify/i.test(message)) {
    return UNSIGNED_BUILD_HINT;
  }

  return message;
}

export function clearPendingUpdate() {
  pendingUpdate = null;
}

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const currentVersion = await getAppVersion();
    const update = await check();

    if (update) {
      pendingUpdate = update;
      return {
        status: "available",
        currentVersion,
        nextVersion: update.version,
        body: update.body,
      };
    }

    pendingUpdate = null;
    return { status: "up_to_date", version: currentVersion };
  } catch (error) {
    pendingUpdate = null;
    return {
      status: "error",
      message: friendlyUpdateError(error),
    };
  }
}

export async function installPendingUpdate(
  onProgress?: DownloadProgressHandler,
): Promise<{ status: "relaunching" } | { status: "error"; message: string }> {
  if (!pendingUpdate) {
    return { status: "error", message: "No update is ready to install." };
  }

  try {
    let downloaded = 0;
    let total: number | undefined;

    await pendingUpdate.downloadAndInstall((event: DownloadEvent) => {
      if (event.event === "Started") {
        total = event.data.contentLength;
        downloaded = 0;
        onProgress?.(total ? 0 : null);
      } else if (event.event === "Progress") {
        downloaded += event.data.chunkLength;
        if (total && total > 0) {
          onProgress?.(Math.min(100, Math.round((downloaded / total) * 100)));
        }
      } else if (event.event === "Finished") {
        onProgress?.(100);
      }
    });

    const { relaunch } = await import("@tauri-apps/plugin-process");
    await relaunch();
    return { status: "relaunching" };
  } catch (error) {
    return {
      status: "error",
      message: friendlyUpdateError(error),
    };
  }
}
