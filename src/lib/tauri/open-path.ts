import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";

export async function openFilePath(path: string): Promise<void> {
  await openPath(path);
}

export async function showFileInFolder(path: string): Promise<void> {
  await revealItemInDir(path);
}
