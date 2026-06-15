import { useState, type ReactNode } from "react";
import {
  BoldIcon,
  CodeIcon,
  FilePlusIcon,
  FolderOpenIcon,
  HeadingIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  ReplaceIcon,
  SaveIcon,
  SearchIcon,
  SparklesIcon,
  StrikethroughIcon,
  TableIcon,
  Undo2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MOD_LABEL } from "@/lib/keyboard";
import { useEditorStore } from "@/stores/editor-store";
import { useDocumentStore } from "@/stores/document-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  ToolbarPortalPanel,
  useToolbarPopover,
} from "@/components/shell/toolbar-popover";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Shared types & base button                                                */
/* -------------------------------------------------------------------------- */

interface ToolbarAction {
  id: string;
  label: string;
  shortcut?: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({ action }: { action: ToolbarAction }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={action.label}
            className={cn(
              "text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent",
              action.disabled && "opacity-40",
            )}
          />
        }
      >
        {action.icon}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {action.label}
        {action.shortcut ? (
          <span className="ml-1.5 text-background/70">{action.shortcut}</span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarGroup({
  actions,
  label,
}: {
  actions: ToolbarAction[];
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5" role="group" aria-label={label}>
      {actions.map((action) => (
        <ToolbarButton key={action.id} action={action} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Heading menu                                                              */
/* -------------------------------------------------------------------------- */

const HEADING_OPTIONS = [
  { level: 0, label: "Paragraph" },
  { level: 1, label: "Heading 1" },
  { level: 2, label: "Heading 2" },
  { level: 3, label: "Heading 3" },
  { level: 4, label: "Heading 4" },
  { level: 5, label: "Heading 5" },
  { level: 6, label: "Heading 6" },
] as const;

function HeadingMenu({
  disabled,
  onSelect,
}: {
  disabled?: boolean;
  onSelect: (level: number) => void;
}) {
  const { anchorRef, panelRef, open, toggle, close, position } = useToolbarPopover();

  return (
    <>
      <div ref={anchorRef}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label="Heading"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => {
                  if (!disabled) toggle();
                }}
                className={cn(
                  "text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent",
                  disabled && "opacity-40",
                  open && "bg-accent/10 text-accent",
                )}
              />
            }
          >
            <HeadingIcon />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Heading
          </TooltipContent>
        </Tooltip>
      </div>

      <ToolbarPortalPanel
        open={open}
        position={position}
        panelRef={panelRef}
        role="menu"
        ariaLabel="Heading levels"
        className="min-w-36 p-1"
      >
        {HEADING_OPTIONS.map((option) => (
          <button
            key={option.level}
            type="button"
            role="menuitem"
            className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm text-foreground hover:bg-accent/10"
            onClick={() => {
              onSelect(option.level);
              close();
            }}
          >
            <span
              className={cn(
                option.level === 0 && "text-sm",
                option.level === 1 && "text-base font-semibold",
                option.level === 2 && "text-sm font-semibold",
                option.level === 3 && "text-sm font-medium",
                option.level >= 4 && "text-xs font-medium",
              )}
            >
              {option.label}
            </span>
          </button>
        ))}
      </ToolbarPortalPanel>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Link / Image popover                                                      */
/* -------------------------------------------------------------------------- */

interface InsertFormPopoverProps {
  disabled?: boolean;
  label: string;
  icon: ReactNode;
  primaryLabel: string;
  secondaryLabel: string;
  primaryPlaceholder: string;
  secondaryPlaceholder: string;
  onSubmit: (primary: string, secondary: string) => void;
}

function InsertFormPopover({
  disabled,
  label,
  icon,
  primaryLabel,
  secondaryLabel,
  primaryPlaceholder,
  secondaryPlaceholder,
  onSubmit,
}: InsertFormPopoverProps) {
  const { anchorRef, panelRef, open, setOpen, close, position } = useToolbarPopover();
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const view = useEditorStore((s) => s.view);

  const handleOpen = () => {
    if (disabled) return;
    let defaultPrimary = "";
    if (view) {
      const { from, to } = view.state.selection.main;
      if (from !== to) {
        defaultPrimary = view.state.sliceDoc(from, to);
      }
    }
    setPrimary(defaultPrimary);
    setSecondary("");
    setOpen(true);
  };

  const handleSubmit = () => {
    onSubmit(primary, secondary);
    close();
  };

  return (
    <>
      <div ref={anchorRef}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label={label}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={handleOpen}
                className={cn(
                  "text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent",
                  disabled && "opacity-40",
                  open && "bg-accent/10 text-accent",
                )}
              />
            }
          >
            {icon}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      </div>

      <ToolbarPortalPanel
        open={open}
        position={position}
        panelRef={panelRef}
        role="dialog"
        ariaLabel={label}
        className="w-56 p-3"
      >
        <div
          className="space-y-2"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
        >
          <label className="block space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              {primaryLabel}
            </span>
            <input
              type="text"
              value={primary}
              onChange={(event) => setPrimary(event.target.value)}
              placeholder={primaryPlaceholder}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              {secondaryLabel}
            </span>
            <input
              type="text"
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
              placeholder={secondaryPlaceholder}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
          <div className="flex justify-end gap-1.5 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={close}
            >
              Cancel
            </Button>
            <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSubmit}>
              Insert
            </Button>
          </div>
        </div>
      </ToolbarPortalPanel>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

interface ActivityToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onLoadSample: () => void;
}

export function ActivityToolbar({
  onNew,
  onOpen,
  onSave,
  onLoadSample,
}: ActivityToolbarProps) {
  const isConverting = useDocumentStore((s) => s.isConverting);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const layoutMode = useSettingsStore((s) => s.layoutMode);
  const view = useEditorStore((s) => s.view);

  const fileDisabled = isConverting;
  const formatDisabled = isConverting || layoutMode === "preview" || !view;

  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const toggleBold = useEditorStore((s) => s.toggleBold);
  const toggleItalic = useEditorStore((s) => s.toggleItalic);
  const toggleStrikethrough = useEditorStore((s) => s.toggleStrikethrough);
  const setHeading = useEditorStore((s) => s.setHeading);
  const toggleInlineCode = useEditorStore((s) => s.toggleInlineCode);
  const toggleBulletList = useEditorStore((s) => s.toggleBulletList);
  const toggleOrderedList = useEditorStore((s) => s.toggleOrderedList);
  const toggleTaskList = useEditorStore((s) => s.toggleTaskList);
  const toggleBlockquote = useEditorStore((s) => s.toggleBlockquote);
  const insertLink = useEditorStore((s) => s.insertLink);
  const insertImage = useEditorStore((s) => s.insertImage);
  const insertTable = useEditorStore((s) => s.insertTable);
  const insertHorizontalRule = useEditorStore((s) => s.insertHorizontalRule);
  const openFind = useEditorStore((s) => s.openFind);
  const openReplace = useEditorStore((s) => s.openReplace);

  /* ----- file actions ----- */
  const fileActions: ToolbarAction[] = [
    {
      id: "new",
      label: "New",
      shortcut: "Ctrl+N",
      icon: <FilePlusIcon />,
      onClick: onNew,
      disabled: fileDisabled,
    },
    {
      id: "open",
      label: "Open",
      shortcut: "Ctrl+O",
      icon: <FolderOpenIcon />,
      onClick: onOpen,
      disabled: fileDisabled,
    },
    {
      id: "save",
      label: "Save",
      shortcut: "Ctrl+S",
      icon: <SaveIcon />,
      onClick: onSave,
      disabled: fileDisabled || !isDirty,
    },
    {
      id: "sample",
      label: "Open Sample",
      icon: <SparklesIcon />,
      onClick: onLoadSample,
      disabled: fileDisabled,
    },
  ];

  /* ----- history ----- */
  const historyActions: ToolbarAction[] = [
    {
      id: "undo",
      label: "Undo",
      shortcut: `${MOD_LABEL}+Z`,
      icon: <Undo2Icon />,
      onClick: undo,
      disabled: formatDisabled,
    },
    {
      id: "redo",
      label: "Redo",
      shortcut: `${MOD_LABEL}+Shift+Z`,
      icon: <Redo2Icon />,
      onClick: redo,
      disabled: formatDisabled,
    },
  ];

  /* ----- inline formatting ----- */
  const inlineActions: ToolbarAction[] = [
    {
      id: "bold",
      label: "Bold",
      shortcut: `${MOD_LABEL}+B`,
      icon: <BoldIcon />,
      onClick: toggleBold,
      disabled: formatDisabled,
    },
    {
      id: "italic",
      label: "Italic",
      shortcut: `${MOD_LABEL}+I`,
      icon: <ItalicIcon />,
      onClick: toggleItalic,
      disabled: formatDisabled,
    },
    {
      id: "strikethrough",
      label: "Strikethrough",
      shortcut: `${MOD_LABEL}+Shift+S`,
      icon: <StrikethroughIcon />,
      onClick: toggleStrikethrough,
      disabled: formatDisabled,
    },
    {
      id: "code",
      label: "Code",
      shortcut: `${MOD_LABEL}+E`,
      icon: <CodeIcon />,
      onClick: toggleInlineCode,
      disabled: formatDisabled,
    },
  ];

  /* ----- block formatting ----- */
  const blockActions: ToolbarAction[] = [
    {
      id: "bullet-list",
      label: "Bullet list",
      icon: <ListIcon />,
      onClick: toggleBulletList,
      disabled: formatDisabled,
    },
    {
      id: "ordered-list",
      label: "Ordered list",
      icon: <ListOrderedIcon />,
      onClick: toggleOrderedList,
      disabled: formatDisabled,
    },
    {
      id: "task-list",
      label: "Task list",
      icon: <ListChecksIcon />,
      onClick: toggleTaskList,
      disabled: formatDisabled,
    },
    {
      id: "quote",
      label: "Blockquote",
      icon: <QuoteIcon />,
      onClick: toggleBlockquote,
      disabled: formatDisabled,
    },
  ];

  /* ----- insert ----- */
  const insertActions: ToolbarAction[] = [
    {
      id: "table",
      label: "Table",
      icon: <TableIcon />,
      onClick: insertTable,
      disabled: formatDisabled,
    },
    {
      id: "hr",
      label: "Horizontal rule",
      icon: <MinusIcon />,
      onClick: insertHorizontalRule,
      disabled: formatDisabled,
    },
  ];

  /* ----- search ----- */
  const editActions: ToolbarAction[] = [
    {
      id: "find",
      label: "Find",
      shortcut: `${MOD_LABEL}+F`,
      icon: <SearchIcon />,
      onClick: openFind,
      disabled: formatDisabled,
    },
    {
      id: "replace",
      label: "Replace",
      shortcut: `${MOD_LABEL}+H`,
      icon: <ReplaceIcon />,
      onClick: openReplace,
      disabled: formatDisabled,
    },
  ];

  return (
    <aside
      className="flex h-full w-11 shrink-0 flex-col items-center overflow-y-auto border-r border-sidebar-border bg-sidebar/70 py-2 backdrop-blur-md"
      aria-label="Activity toolbar"
    >
      <ToolbarGroup actions={fileActions} label="File actions" />
      <Separator orientation="horizontal" className="my-2 w-6" />
      <ToolbarGroup actions={historyActions} label="History" />
      <Separator orientation="horizontal" className="my-2 w-6" />
      <ToolbarGroup actions={inlineActions} label="Inline formatting" />
      <Separator orientation="horizontal" className="my-2 w-6" />
      <HeadingMenu disabled={formatDisabled} onSelect={setHeading} />
      <Separator orientation="horizontal" className="my-2 w-6" />
      <ToolbarGroup actions={blockActions} label="Block formatting" />
      <Separator orientation="horizontal" className="my-2 w-6" />
      <InsertFormPopover
        disabled={formatDisabled}
        label="Link"
        icon={<LinkIcon />}
        primaryLabel="Label"
        secondaryLabel="URL"
        primaryPlaceholder="link text"
        secondaryPlaceholder="https://"
        onSubmit={insertLink}
      />
      <InsertFormPopover
        disabled={formatDisabled}
        label="Image"
        icon={<ImageIcon />}
        primaryLabel="Alt text"
        secondaryLabel="Image URL"
        primaryPlaceholder="description"
        secondaryPlaceholder="https://"
        onSubmit={insertImage}
      />
      <ToolbarGroup actions={insertActions} label="Insert" />
      <Separator orientation="horizontal" className="my-2 w-6" />
      <ToolbarGroup actions={editActions} label="Edit" />
    </aside>
  );
}
