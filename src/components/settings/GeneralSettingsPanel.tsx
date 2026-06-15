import type { ReactNode } from "react";

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ColorSchemePicker } from "@/components/settings/ColorSchemePicker";
import type { ThemeMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-muted/15 p-3.5">
      <div className="mb-2.5">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function GeneralSettingsPanel() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const lineHeight = useSettingsStore((s) => s.lineHeight);
  const setLineHeight = useSettingsStore((s) => s.setLineHeight);
  const checkForUpdatesOnLaunch = useSettingsStore((s) => s.checkForUpdatesOnLaunch);
  const setCheckForUpdatesOnLaunch = useSettingsStore(
    (s) => s.setCheckForUpdatesOnLaunch,
  );

  return (
    <div className="flex w-full flex-col gap-3">
      <SettingsSection
        title="Appearance"
        description="App shell and workspace look."
      >
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="theme-mode">Theme mode</FieldLabel>
            <Select
              value={themeMode}
              onValueChange={(value) => setThemeMode(value as ThemeMode)}
            >
              <SelectTrigger id="theme-mode" className="h-8 w-full max-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Color scheme</FieldLabel>
            <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
          </Field>
        </FieldGroup>
      </SettingsSection>

      <SettingsSection
        title="Editor"
        description="Markdown editor readability."
      >
        <FieldGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="font-size">Font size</FieldLabel>
              <Select
                value={String(fontSize)}
                onValueChange={(value) => setFontSize(Number(value))}
              >
                <SelectTrigger id="font-size" className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[12, 13, 14, 15, 16, 18, 20].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="line-height">Line height</FieldLabel>
              <Select
                value={String(lineHeight)}
                onValueChange={(value) => setLineHeight(Number(value))}
              >
                <SelectTrigger id="line-height" className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1.4, 1.5, 1.6, 1.7, 1.8, 2].map((lh) => (
                    <SelectItem key={lh} value={String(lh)}>
                      {lh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
      </SettingsSection>

      <SettingsSection
        title="Updates"
        description="Keep FileForge up to date with the latest features and fixes."
      >
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="check-updates-on-launch">
                Check for updates when FileForge opens
              </FieldLabel>
              <FieldDescription>
                You can always check manually from Help → Check for Updates.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="check-updates-on-launch"
              checked={checkForUpdatesOnLaunch}
              onCheckedChange={setCheckForUpdatesOnLaunch}
              aria-label="Check for updates when FileForge opens"
            />
          </Field>
        </FieldGroup>
      </SettingsSection>
    </div>
  );
}
