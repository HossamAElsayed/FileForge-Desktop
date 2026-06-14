import type { ReactNode } from "react";
import {
  BoldIcon,
  CodeIcon,
  FilePlusIcon,
  FolderOpenIcon,
  Heading2Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
  SaveIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MarkdownSnippet } from "@/components/editor/codemirror-setup";
import { useEditorStore } from "@/stores/editor-store";
import { useDocumentStore } from "@/stores/document-store";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

interface ActivityToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onLoadSample: () => void;
}

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

export function ActivityToolbar({
  onNew,
  onOpen,
  onSave,
  onLoadSample,
}: ActivityToolbarProps) {
  const isConverting = useDocumentStore((s) => s.isConverting);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const insertMarkdown = useEditorStore((s) => s.insertMarkdown);
  const view = useEditorStore((s) => s.view);
  const layoutMode = useSettingsStore((s) => s.layoutMode);

  const fileDisabled = isConverting;
  const formatDisabled = isConverting || layoutMode === "preview" || !view;

  const insert = (snippet: MarkdownSnippet) => {
    insertMarkdown(snippet);
  };

  const insertCode = () => {
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to);
    if (selected.includes("\n")) {
      insertMarkdown({
        before: "\n```\n",
        after: "\n```\n",
        placeholder: selected,
      });
    } else {
      insertMarkdown({
        before: "`",
        after: "`",
        placeholder: selected || "code",
      });
    }
  };

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

  const formatActions: ToolbarAction[] = [
    {
      id: "bold",
      label: "Bold",
      icon: <BoldIcon />,
      onClick: () =>
        insert({ before: "**", after: "**", placeholder: "text" }),
      disabled: formatDisabled,
    },
    {
      id: "italic",
      label: "Italic",
      icon: <ItalicIcon />,
      onClick: () => insert({ before: "*", after: "*", placeholder: "text" }),
      disabled: formatDisabled,
    },
    {
      id: "heading",
      label: "Heading",
      icon: <Heading2Icon />,
      onClick: () =>
        insert({ before: "\n## ", after: "\n", placeholder: "Heading" }),
      disabled: formatDisabled,
    },
    {
      id: "list",
      label: "Bullet list",
      icon: <ListIcon />,
      onClick: () =>
        insert({ before: "\n- ", after: "\n", placeholder: "item" }),
      disabled: formatDisabled,
    },
    {
      id: "link",
      label: "Link",
      icon: <LinkIcon />,
      onClick: () =>
        insert({
          before: "[",
          after: "](url)",
          placeholder: "label",
        }),
      disabled: formatDisabled,
    },
    {
      id: "code",
      label: "Code",
      icon: <CodeIcon />,
      onClick: insertCode,
      disabled: formatDisabled,
    },
    {
      id: "quote",
      label: "Quote",
      icon: <QuoteIcon />,
      onClick: () =>
        insert({ before: "\n> ", after: "\n", placeholder: "quote" }),
      disabled: formatDisabled,
    },
  ];

  return (
    <aside
      className="flex h-full w-11 shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar/70 py-2 backdrop-blur-md"
      aria-label="Activity toolbar"
    >
      <ToolbarGroup actions={fileActions} label="File actions" />
      <Separator orientation="horizontal" className="my-2 w-6" />
      <ToolbarGroup actions={formatActions} label="Formatting" />
    </aside>
  );
}
