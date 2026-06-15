import type { ReactNode } from "react";
import {
  InfoIcon,
  KeyboardIcon,
  ScrollTextIcon,
  Settings2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AboutPanel } from "@/components/settings/AboutPanel";
import { ChangelogPanel } from "@/components/settings/ChangelogPanel";
import { GeneralSettingsPanel } from "@/components/settings/GeneralSettingsPanel";
import { ShortcutsPanel } from "@/components/settings/ShortcutsPanel";
import {
  useSettingsStore,
  type PreferencesTab,
} from "@/stores/settings-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS: {
  id: PreferencesTab;
  label: string;
  icon: ReactNode;
  title: string;
  description: string;
}[] = [
  {
    id: "general",
    label: "General",
    icon: <Settings2Icon className="size-3.5" />,
    title: "Appearance & editor",
    description: "Theme, colors, and editor typography.",
  },
  {
    id: "about",
    label: "About",
    icon: <InfoIcon className="size-3.5" />,
    title: "About FileForge",
    description: "Version, author, and updates.",
  },
  {
    id: "changelog",
    label: "What's New",
    icon: <ScrollTextIcon className="size-3.5" />,
    title: "What's New",
    description: "Release history and improvements.",
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    icon: <KeyboardIcon className="size-3.5" />,
    title: "Keyboard shortcuts",
    description: "App and editor shortcut reference.",
  },
];

export function PreferencesDialog() {
  const open = useSettingsStore((s) => s.preferencesOpen);
  const tab = useSettingsStore((s) => s.preferencesTab);
  const setPreferencesOpen = useSettingsStore((s) => s.setPreferencesOpen);
  const setPreferencesTab = useSettingsStore((s) => s.setPreferencesTab);

  const activeMeta = NAV_ITEMS.find((item) => item.id === tab) ?? NAV_ITEMS[0];

  return (
    <Dialog open={open} onOpenChange={setPreferencesOpen}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden p-0 sm:max-w-none w-[min(92vw,720px)]"
      >
        <DialogTitle className="sr-only">Preferences</DialogTitle>

        <div className="flex min-h-[440px] max-h-[min(82vh,580px)]">
          <nav
            role="tablist"
            aria-label="Preferences sections"
            className="flex w-40 shrink-0 flex-col border-r border-border/80 bg-muted/25 px-2 py-3"
          >
            <p className="mb-2 px-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Preferences
            </p>
            <div className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  role="tab"
                  variant="ghost"
                  size="sm"
                  aria-selected={tab === item.id}
                  className={cn(
                    "relative h-8 w-full justify-start gap-2 rounded-md px-2 text-[13px] font-normal",
                    tab === item.id
                      ? "bg-background font-medium text-foreground shadow-sm ring-1 ring-border/60 hover:bg-background"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                  onClick={() => setPreferencesTab(item.id)}
                >
                  {tab === item.id && (
                    <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col bg-background">
            <header className="shrink-0 border-b border-border/80 px-5 py-3">
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                {activeMeta.title}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeMeta.description}
              </p>
            </header>

            <div
              role="tabpanel"
              className="flex-1 overflow-y-auto px-5 py-4"
            >
              {tab === "general" && <GeneralSettingsPanel />}
              {tab === "about" && <AboutPanel active={open && tab === "about"} />}
              {tab === "changelog" && (
                <ChangelogPanel active={open && tab === "changelog"} />
              )}
              {tab === "shortcuts" && <ShortcutsPanel />}
            </div>

            <Separator />

            <div className="flex shrink-0 justify-end px-5 py-2.5">
              <Button size="sm" onClick={() => setPreferencesOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
