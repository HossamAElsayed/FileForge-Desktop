import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  ColorSchemeId,
  LayoutMode,
  ThemeMode,
} from "@/themes";

export type PreferencesTab = "general" | "about" | "changelog" | "shortcuts";

interface SettingsState {
  themeMode: ThemeMode;
  colorScheme: ColorSchemeId;
  layoutMode: LayoutMode;
  fontSize: number;
  lineHeight: number;
  preferencesOpen: boolean;
  preferencesTab: PreferencesTab;
  setThemeMode: (mode: ThemeMode) => void;
  cycleThemeMode: () => void;
  setColorScheme: (scheme: ColorSchemeId) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  openPreferences: (tab?: PreferencesTab) => void;
  setPreferencesOpen: (open: boolean) => void;
  setPreferencesTab: (tab: PreferencesTab) => void;
}

const THEME_CYCLE: ThemeMode[] = ["system", "light", "dark"];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      colorScheme: "default",
      layoutMode: "split",
      fontSize: 14,
      lineHeight: 1.6,
      preferencesOpen: false,
      preferencesTab: "general",
      setThemeMode: (themeMode) => set({ themeMode }),
      cycleThemeMode: () => {
        set((state) => {
          const index = THEME_CYCLE.indexOf(state.themeMode);
          const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
          return { themeMode: next };
        });
      },
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      openPreferences: (tab = "general") =>
        set({ preferencesOpen: true, preferencesTab: tab }),
      setPreferencesOpen: (open) =>
        set((state) => ({
          preferencesOpen: open,
          preferencesTab: open ? state.preferencesTab : "general",
        })),
      setPreferencesTab: (tab) => set({ preferencesTab: tab }),
    }),
    {
      name: "fileforge-settings",
      partialize: (state) => ({
        themeMode: state.themeMode,
        colorScheme: state.colorScheme,
        layoutMode: state.layoutMode,
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
      }),
    },
  ),
);
