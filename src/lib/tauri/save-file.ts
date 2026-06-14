import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

import { SUPPORTED_INPUT_EXTENSIONS } from "@/lib/constants";

const MARKDOWN_EXTENSIONS = SUPPORTED_INPUT_EXTENSIONS.map((ext) =>
  ext.slice(1),
);

export function defaultSavePath(filename: string | null): string {
  if (!filename) return "Untitled.md";
  if (/\.(md|markdown|txt)$/i.test(filename)) return filename;
  return `${filename}.md`;
}

export async function saveMarkdownFile(
  content: string,
  filePath: string,
): Promise<void> {
  await writeTextFile(filePath, content);
}

export async function saveMarkdownFileAs(
  content: string,
  filename: string | null,
): Promise<{ path: string; filename: string }> {
  const savePath = await save({
    defaultPath: defaultSavePath(filename),
    filters: [
      {
        name: "Markdown",
        extensions: MARKDOWN_EXTENSIONS,
      },
    ],
  });

  if (!savePath) {
    throw new Error("Save cancelled");
  }

  await writeTextFile(savePath, content);

  const savedFilename = savePath.split(/[/\\]/).pop() ?? "document.md";
  return { path: savePath, filename: savedFilename };
}

export async function saveOrSaveAs(
  content: string,
  filePath: string | null,
  filename: string | null,
): Promise<{ path: string; filename: string }> {
  if (filePath) {
    await saveMarkdownFile(content, filePath);
    const savedFilename = filePath.split(/[/\\]/).pop() ?? filename ?? "document.md";
    return { path: filePath, filename: savedFilename };
  }

  return saveMarkdownFileAs(content, filename);
}
