import { exists, rename } from "@tauri-apps/plugin-fs";

const ILLEGAL_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export function sanitizeFilename(name: string): string {
  const trimmed = name.trim().replace(ILLEGAL_FILENAME_CHARS, "");
  if (!trimmed) return "Untitled.md";
  if (/\.(md|markdown|txt)$/i.test(trimmed)) return trimmed;
  return `${trimmed}.md`;
}

export function joinPath(dir: string, filename: string): string {
  const separator = dir.includes("\\") ? "\\" : "/";
  const normalizedDir = dir.endsWith(separator) ? dir.slice(0, -1) : dir;
  return `${normalizedDir}${separator}${filename}`;
}

export function getDirectoryPath(filePath: string): string {
  const lastSeparator = Math.max(
    filePath.lastIndexOf("/"),
    filePath.lastIndexOf("\\"),
  );
  if (lastSeparator <= 0) return filePath;
  return filePath.slice(0, lastSeparator);
}

export async function renameMarkdownFile(
  filePath: string,
  newFilename: string,
): Promise<{ path: string; filename: string }> {
  const filename = sanitizeFilename(newFilename);
  const directory = getDirectoryPath(filePath);
  const newPath = joinPath(directory, filename);

  if (newPath === filePath) {
    return { path: filePath, filename };
  }

  if (await exists(newPath)) {
    throw new Error("A file with that name already exists.");
  }

  await rename(filePath, newPath);
  return { path: newPath, filename };
}
