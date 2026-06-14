import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ColorSchemePicker } from "@/components/settings/ColorSchemePicker";
import type { ThemeMode } from "@/themes";
import { useSettingsStore } from "@/stores/settings-store";

export function SettingsDialog() {
  const open = useSettingsStore((s) => s.settingsOpen);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const lineHeight = useSettingsStore((s) => s.lineHeight);
  const setLineHeight = useSettingsStore((s) => s.setLineHeight);

  return (
    <Dialog open={open} onOpenChange={setSettingsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize appearance and editor preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="theme-mode">Theme mode</Label>
            <Select
              id="theme-mode"
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color scheme</Label>
            <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-size">Editor font size</Label>
              <Select
                id="font-size"
                value={String(fontSize)}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                {[12, 13, 14, 15, 16, 18, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="line-height">Line height</Label>
              <Select
                id="line-height"
                value={String(lineHeight)}
                onChange={(e) => setLineHeight(Number(e.target.value))}
              >
                {[1.4, 1.5, 1.6, 1.7, 1.8, 2].map((lh) => (
                  <option key={lh} value={lh}>
                    {lh}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setSettingsOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
