export type ColorSchemeId = "default" | "github" | "nord" | "dracula";
export type ThemeMode = "system" | "light" | "dark";
export type LayoutMode = "split" | "focus" | "preview";

export interface ColorScheme {
  id: ColorSchemeId;
  label: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

const baseVars = {
  "--radius": "0.5rem",
};

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "default",
    label: "Default",
    light: {
      ...baseVars,
      "--background": "#f8fafc",
      "--foreground": "#0f172a",
      "--card": "#ffffff",
      "--muted": "#f1f5f9",
      "--muted-foreground": "#64748b",
      "--border": "#e2e8f0",
      "--accent": "#6366f1",
      "--accent-foreground": "#ffffff",
      "--editor-bg": "#ffffff",
      "--preview-bg": "#f8fafc",
      "--toolbar-bg": "rgba(255, 255, 255, 0.85)",
      "--btn-hover": "rgba(0, 0, 0, 0.05)",
      "--accent-subtle": "rgba(99, 102, 241, 0.12)",
    },
    dark: {
      ...baseVars,
      "--background": "#0f1117",
      "--foreground": "#e2e8f0",
      "--card": "#161922",
      "--muted": "#1e2230",
      "--muted-foreground": "#94a3b8",
      "--border": "#2a3042",
      "--accent": "#818cf8",
      "--accent-foreground": "#0f1117",
      "--editor-bg": "#12151e",
      "--preview-bg": "#0f1117",
      "--toolbar-bg": "rgba(16, 18, 26, 0.88)",
      "--btn-hover": "rgba(255, 255, 255, 0.06)",
      "--accent-subtle": "rgba(129, 140, 248, 0.15)",
    },
  },
  {
    id: "github",
    label: "GitHub",
    light: {
      ...baseVars,
      "--background": "#ffffff",
      "--foreground": "#1f2328",
      "--card": "#ffffff",
      "--muted": "#f6f8fa",
      "--muted-foreground": "#656d76",
      "--border": "#d1d9e0",
      "--accent": "#0969da",
      "--accent-foreground": "#ffffff",
      "--editor-bg": "#ffffff",
      "--preview-bg": "#f6f8fa",
      "--toolbar-bg": "rgba(255, 255, 255, 0.9)",
      "--btn-hover": "rgba(0, 0, 0, 0.04)",
      "--accent-subtle": "rgba(9, 105, 218, 0.12)",
    },
    dark: {
      ...baseVars,
      "--background": "#0d1117",
      "--foreground": "#e6edf3",
      "--card": "#161b22",
      "--muted": "#21262d",
      "--muted-foreground": "#8b949e",
      "--border": "#30363d",
      "--accent": "#4493f8",
      "--accent-foreground": "#0d1117",
      "--editor-bg": "#0d1117",
      "--preview-bg": "#010409",
      "--toolbar-bg": "rgba(13, 17, 23, 0.9)",
      "--btn-hover": "rgba(255, 255, 255, 0.06)",
      "--accent-subtle": "rgba(68, 147, 248, 0.15)",
    },
  },
  {
    id: "nord",
    label: "Nord",
    light: {
      ...baseVars,
      "--background": "#eceff4",
      "--foreground": "#2e3440",
      "--card": "#e5e9f0",
      "--muted": "#d8dee9",
      "--muted-foreground": "#4c566a",
      "--border": "#c8d0db",
      "--accent": "#5e81ac",
      "--accent-foreground": "#eceff4",
      "--editor-bg": "#eceff4",
      "--preview-bg": "#e5e9f0",
      "--toolbar-bg": "rgba(236, 239, 244, 0.9)",
      "--btn-hover": "rgba(46, 52, 64, 0.06)",
      "--accent-subtle": "rgba(94, 129, 172, 0.15)",
    },
    dark: {
      ...baseVars,
      "--background": "#2e3440",
      "--foreground": "#eceff4",
      "--card": "#3b4252",
      "--muted": "#434c5e",
      "--muted-foreground": "#d8dee9",
      "--border": "#4c566a",
      "--accent": "#88c0d0",
      "--accent-foreground": "#2e3440",
      "--editor-bg": "#2e3440",
      "--preview-bg": "#242933",
      "--toolbar-bg": "rgba(46, 52, 64, 0.9)",
      "--btn-hover": "rgba(236, 239, 244, 0.08)",
      "--accent-subtle": "rgba(136, 192, 208, 0.15)",
    },
  },
  {
    id: "dracula",
    label: "Dracula",
    light: {
      ...baseVars,
      "--background": "#f8f8f2",
      "--foreground": "#282a36",
      "--card": "#ffffff",
      "--muted": "#f0f0ea",
      "--muted-foreground": "#6272a4",
      "--border": "#e0e0d8",
      "--accent": "#bd93f9",
      "--accent-foreground": "#282a36",
      "--editor-bg": "#ffffff",
      "--preview-bg": "#f8f8f2",
      "--toolbar-bg": "rgba(248, 248, 242, 0.9)",
      "--btn-hover": "rgba(40, 42, 54, 0.05)",
      "--accent-subtle": "rgba(189, 147, 249, 0.15)",
    },
    dark: {
      ...baseVars,
      "--background": "#282a36",
      "--foreground": "#f8f8f2",
      "--card": "#343746",
      "--muted": "#44475a",
      "--muted-foreground": "#bd93f9",
      "--border": "#6272a4",
      "--accent": "#ff79c6",
      "--accent-foreground": "#282a36",
      "--editor-bg": "#282a36",
      "--preview-bg": "#21222c",
      "--toolbar-bg": "rgba(40, 42, 54, 0.9)",
      "--btn-hover": "rgba(248, 248, 242, 0.08)",
      "--accent-subtle": "rgba(255, 121, 198, 0.15)",
    },
  },
];

export function getScheme(id: ColorSchemeId): ColorScheme {
  return COLOR_SCHEMES.find((s) => s.id === id) ?? COLOR_SCHEMES[0];
}

export function resolveThemeMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(
  schemeId: ColorSchemeId,
  themeMode: ThemeMode,
): void {
  const scheme = getScheme(schemeId);
  const resolved = resolveThemeMode(themeMode);
  const vars = resolved === "dark" ? scheme.dark : scheme.light;
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.dataset.scheme = schemeId;

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
