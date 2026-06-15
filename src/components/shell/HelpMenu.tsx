import { useEffect, useRef, useState } from "react";
import {
  CircleHelpIcon,
  InfoIcon,
  KeyboardIcon,
  RefreshCwIcon,
  ScrollTextIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PreferencesTab } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

interface HelpMenuProps {
  onOpenPreferences: (tab: PreferencesTab) => void;
  onCheckUpdates: () => void;
}

export function HelpMenu({
  onOpenPreferences,
  onCheckUpdates,
}: HelpMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const run = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        title="Help"
        aria-label="Help"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelpIcon />
      </Button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute top-[calc(100%+4px)] right-0 z-50 min-w-[11rem] rounded-lg border border-border bg-popover p-1 shadow-lg",
          )}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent/10"
            onClick={() => run(() => onOpenPreferences("about"))}
          >
            <InfoIcon className="size-3.5 text-muted-foreground" />
            About
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent/10"
            onClick={() => run(() => onOpenPreferences("changelog"))}
          >
            <ScrollTextIcon className="size-3.5 text-muted-foreground" />
            What's New
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent/10"
            onClick={() => run(() => onOpenPreferences("shortcuts"))}
          >
            <KeyboardIcon className="size-3.5 text-muted-foreground" />
            Shortcuts
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent/10"
            onClick={() => run(onCheckUpdates)}
          >
            <RefreshCwIcon className="size-3.5 text-muted-foreground" />
            Check for Updates
          </button>
        </div>
      ) : null}
    </div>
  );
}
