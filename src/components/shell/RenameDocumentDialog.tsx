import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sanitizeFilename } from "@/lib/tauri/rename-file";
import { cn } from "@/lib/utils";

const ILLEGAL_FILENAME_CHARS = /[\\/:*?"<>|]/;

interface RenameDocumentDialogProps {
  open: boolean;
  filename: string | null;
  filePath: string | null;
  onConfirm: (newFilename: string) => void;
  onCancel: () => void;
}

export function RenameDocumentDialog({
  open,
  filename,
  filePath,
  onConfirm,
  onCancel,
}: RenameDocumentDialogProps) {
  const [value, setValue] = useState(filename ?? "Untitled.md");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(filename ?? "Untitled.md");
      setError(null);
    }
  }, [open, filename]);

  const validate = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return "Name cannot be empty.";
    if (ILLEGAL_FILENAME_CHARS.test(trimmed)) {
      return 'Name cannot contain \\ / : * ? " < > |';
    }
    return null;
  };

  const handleConfirm = () => {
    const validationError = validate(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(sanitizeFilename(value));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>
            {filePath
              ? "The file will be renamed on disk in its current folder."
              : "Display name only. Save the file to apply the name on disk."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(validate(event.target.value));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleConfirm();
              }
            }}
            className={cn(
              "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              error && "border-destructive ring-destructive/20",
            )}
            aria-invalid={!!error}
            autoFocus
          />
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!!error}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
