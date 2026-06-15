import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  BugIcon,
  ExternalLinkIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CHANGELOG,
  type ChangelogCategory,
  type ChangelogEntry,
} from "@/data/changelog";
import { APP_GITHUB_URL } from "@/lib/app-metadata";
import { formatChangelogDate, isCurrentVersion } from "@/lib/changelog";
import { getAppVersion } from "@/lib/tauri/app-info";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  ChangelogCategory,
  { label: string; icon: typeof SparklesIcon }
> = {
  new: { label: "New", icon: SparklesIcon },
  improvements: { label: "Improvements", icon: WrenchIcon },
  fixes: { label: "Fixes", icon: BugIcon },
};

const CATEGORY_ORDER: ChangelogCategory[] = ["new", "improvements", "fixes"];

interface ChangelogPanelProps {
  active: boolean;
}

function ChangelogCategoryList({
  category,
  items,
}: {
  category: ChangelogCategory;
  items: string[];
}) {
  const { label, icon: Icon } = CATEGORY_META[category];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3 shrink-0" />
        {label}
      </div>
      <ul className="space-y-0.5 pl-[18px]">
        {items.map((item) => (
          <li
            key={item}
            className="relative text-[13px] leading-snug text-foreground/90 before:absolute before:-left-3 before:top-[0.55em] before:size-1 before:rounded-full before:bg-muted-foreground/40"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChangelogReleaseCard({
  entry,
  isCurrent,
  isLast,
}: {
  entry: ChangelogEntry;
  isCurrent: boolean;
  isLast: boolean;
}) {
  const categories = CATEGORY_ORDER.filter(
    (category) => (entry.changes[category]?.length ?? 0) > 0,
  );

  return (
    <article className="relative pl-5">
      <span
        className={cn(
          "absolute top-1.5 left-0 z-10 size-2 -translate-x-1/2 rounded-full ring-2 ring-background",
          isCurrent ? "bg-primary" : "bg-muted-foreground/35",
        )}
        aria-hidden
      />
      {!isLast && (
        <span
          className="absolute top-3 left-0 h-[calc(100%+12px)] w-px -translate-x-1/2 bg-border/80"
          aria-hidden
        />
      )}

      <div
        className={cn(
          "rounded-lg border p-3.5",
          isCurrent
            ? "border-primary/25 bg-primary/4"
            : "border-border/60 bg-muted/15",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[11px]">
            v{entry.version}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {formatChangelogDate(entry.date)}
          </span>
          {isCurrent && (
            <Badge className="h-5 px-2 text-[10px]">Current</Badge>
          )}
        </div>

        <h3 className="mt-2 text-[13px] font-semibold text-foreground">
          {entry.title}
        </h3>

        {categories.length > 0 && (
          <div className="mt-3 space-y-3">
            {categories.map((category) => (
              <ChangelogCategoryList
                key={category}
                category={category}
                items={entry.changes[category]!}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function ChangelogPanel({ active }: ChangelogPanelProps) {
  const [installedVersion, setInstalledVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    getAppVersion()
      .then(setInstalledVersion)
      .catch(() => setInstalledVersion(null));
  }, [active]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="space-y-4">
        {CHANGELOG.map((entry, index) => (
          <ChangelogReleaseCard
            key={entry.version}
            entry={entry}
            isCurrent={isCurrentVersion(entry, installedVersion)}
            isLast={index === CHANGELOG.length - 1}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => openUrl(`${APP_GITHUB_URL}/releases`)}
      >
        <ExternalLinkIcon />
        View releases on GitHub
      </Button>
    </div>
  );
}
