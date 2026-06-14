import { SHORTCUT_GROUPS } from "@/lib/shortcuts";

export function ShortcutsPanel() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {SHORTCUT_GROUPS.map((group) => (
        <section
          key={group.label}
          className="rounded-lg border border-border/60 bg-muted/15 p-3"
        >
          <h3 className="mb-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            {group.label}
          </h3>
          <dl className="space-y-1">
            {group.shortcuts.map((shortcut) => (
              <div
                key={`${group.label}-${shortcut.keys}`}
                className="flex items-center justify-between gap-3 rounded-md bg-background/80 px-2 py-1.5 text-[13px]"
              >
                <dt className="text-muted-foreground">{shortcut.action}</dt>
                <dd className="shrink-0">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-px font-mono text-[10px]">
                    {shortcut.keys}
                  </kbd>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
