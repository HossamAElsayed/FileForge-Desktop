import { MAX_FILE_SIZE_BYTES, SUPPORTED_INPUT_EXTENSIONS } from "@/lib/constants";

export function validateAndReadFile(
  file: File,
  onSuccess: (content: string, filename: string, size: number) => void,
  onError: (message: string) => void,
): void {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (
    !SUPPORTED_INPUT_EXTENSIONS.includes(
      extension as (typeof SUPPORTED_INPUT_EXTENSIONS)[number],
    )
  ) {
    onError(
      `Unsupported file type. Please upload ${SUPPORTED_INPUT_EXTENSIONS.join(", ")} files.`,
    );
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    onError(
      `File is too large. Choose a file under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB and try again.`,
    );
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result === "string") {
      onSuccess(result, file.name, file.size);
    } else {
      onError("Failed to read file contents.");
    }
  };
  reader.onerror = () => onError("Failed to read file.");
  reader.readAsText(file);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateContentSize(
  content: string,
  onError: (message: string) => void,
): boolean {
  const bytes = new TextEncoder().encode(content).length;
  if (bytes > MAX_FILE_SIZE_BYTES) {
    onError(
      `Content is too large. Keep it under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
    );
    return false;
  }
  return true;
}
