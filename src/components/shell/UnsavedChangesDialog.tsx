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
  onSave: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ACTION_COPY: Record<
  DiscardAction,
  { title: string; description: string }
> = {
  new: {
    title: "Save changes?",
    description: "Your current document has unsaved changes.",
  },
  open: {
    title: "Save changes?",
    description: "Opening a file will replace your current document.",
  },
  sample: {
    title: "Save changes?",
    description: "Loading the sample will replace your current document.",
  },
  close: {
    title: "Save changes?",
    description: "Closing will discard unsaved changes unless you save first.",
  },
};

export function UnsavedChangesDialog({
  open,
  action = "new",
  onSave,
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
          <Button variant="outline" onClick={onConfirm}>
            Don&apos;t Save
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
