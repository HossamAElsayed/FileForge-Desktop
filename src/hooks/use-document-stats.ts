export function useDocumentStats(content: string) {
  const trimmed = content.trim();
  const characters = content.length;
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const lines = content ? content.split("\n").length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return { characters, words, lines, readingTimeMinutes };
}
