import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface AnchorPosition {
  top: number;
  left: number;
}

function useAnchorPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
): AnchorPosition | null {
  const [position, setPosition] = useState<AnchorPosition | null>(null);

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.right + 8,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, update]);

  return position;
}

export function useToolbarPopover() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);
  const position = useAnchorPosition(anchorRef, open);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return { anchorRef, panelRef, open, setOpen, close, toggle, position };
}

interface ToolbarPortalPanelProps {
  open: boolean;
  position: AnchorPosition | null;
  panelRef: RefObject<HTMLDivElement | null>;
  role: "menu" | "dialog";
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}

export function ToolbarPortalPanel({
  open,
  position,
  panelRef,
  role,
  ariaLabel,
  className,
  children,
}: ToolbarPortalPanelProps) {
  if (!open || !position) return null;

  return createPortal(
    <div
      ref={panelRef}
      role={role}
      aria-label={ariaLabel}
      style={{ top: position.top, left: position.left }}
      className={cn(
        "fixed z-[200] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
