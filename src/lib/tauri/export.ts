import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

import { markdownToPdfHtml } from "@/lib/converters/markdown-to-html";
import { getAppVersion } from "@/lib/tauri/app-info";

export async function exportMarkdownToPdf(
  content: string,
  filename: string | null,
): Promise<{ outputName: string; path: string }> {
  const fullHtml = await markdownToPdfHtml(content, filename);
  const pdfBytes = await invoke<number[]>("generate_pdf", { html: fullHtml });

  const outputName = filename
    ? filename.replace(/\.(md|markdown|txt)$/i, ".pdf")
    : "document.pdf";

  const savePath = await save({
    defaultPath: outputName,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });

  if (!savePath) {
    throw new Error("Export cancelled");
  }

  await writeFile(savePath, new Uint8Array(pdfBytes));

  return { outputName, path: savePath };
}

export type UpdateCheckResult =
  | { status: "up_to_date"; version: string }
  | { status: "downloading" }
  | { status: "error"; message: string };

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const currentVersion = await getAppVersion();
    const update = await check();

    if (update) {
      await update.downloadAndInstall();
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
      return { status: "downloading" };
    }

    return { status: "up_to_date", version: currentVersion };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Could not check for updates",
    };
  }
}

export function handleUpdateCheckResult(result: UpdateCheckResult): void {
  switch (result.status) {
    case "up_to_date":
      toast.success("You're up to date", {
        description: `Version ${result.version}`,
      });
      break;
    case "downloading":
      toast.loading("Downloading update…", {
        description: "The app will restart when ready",
      });
      break;
    case "error":
      toast.error("Update check failed", {
        description: result.message,
      });
      break;
  }
}
