import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

import { markdownToPdfHtml } from "@/lib/converters/markdown-to-html";

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
