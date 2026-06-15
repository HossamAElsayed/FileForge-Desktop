import type { ChangelogEntry } from "@/data/changelog";

export function formatChangelogDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isCurrentVersion(
  entry: ChangelogEntry,
  installedVersion: string | null,
): boolean {
  if (!installedVersion) return false;
  return entry.version === installedVersion;
}
