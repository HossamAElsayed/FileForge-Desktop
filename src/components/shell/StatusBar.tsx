import { useDocumentStats } from "@/hooks/use-document-stats";
import { useDocumentStore } from "@/stores/document-store";

export function StatusBar() {
  const content = useDocumentStore((s) => s.content);
  const filename = useDocumentStore((s) => s.filename);
  const isConverting = useDocumentStore((s) => s.isConverting);
  const convertProgress = useDocumentStore((s) => s.convertProgress);
  const statusMessage = useDocumentStore((s) => s.statusMessage);

  const { words, characters, readingTimeMinutes } = useDocumentStats(content);
  const hasContent = content.trim().length > 0;

  return (
    <footer className="status-bar">
      <div className="flex min-w-0 items-center gap-2 truncate">
        {hasContent ? (
          <>
            <strong>{filename ?? "Untitled"}</strong>
            <span>·</span>
            <span>{words.toLocaleString()} words</span>
            <span>·</span>
            <span>{characters.toLocaleString()} chars</span>
            <span>·</span>
            <span>{readingTimeMinutes} min read</span>
          </>
        ) : (
          <span>Add markdown to get started</span>
        )}
      </div>

      <div className="truncate" aria-live="polite">
        {isConverting ? (
          <span>
            {statusMessage} ({convertProgress}%)
          </span>
        ) : (
          <span>Processed locally — nothing is stored</span>
        )}
      </div>
    </footer>
  );
}
