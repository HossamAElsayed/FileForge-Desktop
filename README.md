# FileForge Desktop

A production-ready Tauri 2 desktop app for converting Markdown to PDF locally. Built with a Texodus-inspired native UI shell.

## Features

- **CodeMirror 6** markdown editor with syntax highlighting
- **Live GFM preview** with Prism code-block highlighting
- **Split / Focus / Preview** layout modes
- **4 color schemes** (Default, GitHub, Nord, Dracula) with light/dark/system themes
- **Local PDF export** via system Chrome or Edge (no cloud, no network)
- **Native file dialogs**, app menu shortcuts, system tray, window state persistence
- **Auto-updater** via GitHub Releases (requires signed builds in production)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS
- **Google Chrome** or **Microsoft Edge** (required for PDF export)

## Development

```bash
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

Produces installers for your current platform (`.msi`/`.exe` on Windows, `.dmg`/`.app` on macOS).

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open file |
| `Ctrl+Shift+E` | Export to PDF |
| `Ctrl+,` | Settings |

## Project structure

- `src/` — React frontend (Texodus-inspired shell, CodeMirror editor, preview)
- `src-tauri/` — Rust backend (PDF generation, tray, menus)
- `src/lib/converters/` — Markdown → HTML pipeline (ported from FileForge web)
- `src/themes/` — CSS variable color schemes

## PDF engine

PDF export uses your locally installed Chrome or Edge in headless mode. Set `PUPPETEER_EXECUTABLE_PATH` to override the browser path.

## License

Private — FileForge
