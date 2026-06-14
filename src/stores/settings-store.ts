import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  ColorSchemeId,
  LayoutMode,
  ThemeMode,
} from "@/themes";

interface SettingsState {
  themeMode: ThemeMode;
  colorScheme: ColorSchemeId;
  layoutMode: LayoutMode;
  fontSize: number;
  lineHeight: number;
  settingsOpen: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  cycleThemeMode: () => void;
  setColorScheme: (scheme: ColorSchemeId) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setSettingsOpen: (open: boolean) => void;
}

const THEME_CYCLE: ThemeMode[] = ["system", "light", "dark"];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      themeMode: "system",
      colorScheme: "default",
      layoutMode: "split",
      fontSize: 14,
      lineHeight: 1.6,
      settingsOpen: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      cycleThemeMode: () => {
        const current = get().themeMode;
        const index = THEME_CYCLE.indexOf(current);
        const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
        set({ themeMode: next });
      },
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
    }),
    { name: "fileforge-settings" },
  ),
);
