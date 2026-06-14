import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

import { MAX_FILE_SIZE_BYTES, SUPPORTED_INPUT_EXTENSIONS } from "@/lib/constants";

export async function openMarkdownFile(): Promise<{
  content: string;
  filename: string;
} | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Markdown",
        extensions: SUPPORTED_INPUT_EXTENSIONS.map((ext) => ext.slice(1)),
      },
    ],
  });

  if (!selected || typeof selected !== "string") {
    return null;
  }

  const content = await readTextFile(selected);
  const bytes = new TextEncoder().encode(content).length;
  if (bytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File is too large. Choose a file under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
    );
  }

  const filename = selected.split(/[/\\]/).pop() ?? "document.md";
  return { content, filename };
}
