import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DiscardAction = "new" | "open" | "sample" | "close";

interface UnsavedChangesDialogProps {
  open: boolean;
  action?: DiscardAction;
  onConfirm: () => void;
  onCancel: () => void;
}

const ACTION_COPY: Record<
  DiscardAction,
  { title: string; description: string }
> = {
  new: {
    title: "Discard unsaved changes?",
    description: "Your current document has unsaved changes.",
  },
  open: {
    title: "Discard unsaved changes?",
    description: "Opening a file will replace your current document.",
  },
  sample: {
    title: "Discard unsaved changes?",
    description: "Loading the sample will replace your current document.",
  },
  close: {
    title: "Discard unsaved changes?",
    description: "Closing will discard unsaved changes.",
  },
};

export function UnsavedChangesDialog({
  open,
  action = "new",
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  const copy = ACTION_COPY[action];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
