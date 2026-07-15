# QPDF GUI

Cross-platform desktop PDF toolbox powered by [qpdf](https://qpdf.readthedocs.io/).

Built with **Tauri v2** (Rust) + **React 19** + **TypeScript** + **TailwindCSS v4**.

## Download

Download the latest release for your platform from [GitHub Releases](https://github.com/MrMostafaMo/qpdf-gui/releases/latest).

| Platform | Format |
|----------|--------|
| Linux | `.deb` (Ubuntu/Debian), `.rpm` (Fedora/RHEL) |
| Windows | `.msi` |
| macOS | `.dmg` (Apple Silicon) |

## Features

| Operation | Description |
|-----------|-------------|
| Extract Pages | Pull specific pages from a PDF into a new file |
| Merge PDFs | Combine multiple PDF files into one (reorderable) |
| Split PDF | Split into separate files by page ranges or every N pages |
| Rotate Pages | Rotate pages by 90, 180, or 270 degrees |
| Delete Pages | Remove specific pages from a PDF |
| Encrypt PDF | Add password protection (AES-256, multi-file bulk encrypt) |
| Decrypt PDF | Remove password protection (multi-file bulk decrypt) |
| Optimize PDF | Reduce file size with quality presets (shows before/after comparison) |
| Linearize PDF | Optimize for fast web viewing |
| PDF Info | View metadata and open in system viewer |
| Batch Operations | Apply optimize or linearize to all PDFs in a folder |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) 1.77+

**Note:** qpdf is bundled with the app. No separate installation required.

## Install & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm tauri dev
```

## Build

```bash
# Build distributable for your platform
pnpm tauri build
```

Output will be in `src-tauri/target/release/bundle/`.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open Info page |
| `Ctrl+Shift+E` | Extract |
| `Ctrl+Shift+M` | Merge |
| `Ctrl+Shift+S` | Split |
| `Ctrl+Shift+D` | Delete |
| `Ctrl+Shift+R` | Rotate |
| `Ctrl+Shift+Z` | Optimize |
| `Ctrl+Shift+L` | Linearize |
| `Ctrl+,` | Settings |

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop runtime | Tauri v2 (Rust) |
| Frontend | React 19, TypeScript 6, Vite 8 |
| Styling | TailwindCSS v4, shadcn/ui |
| State | Zustand 5 |
| Routing | React Router v7 |
| Icons | Lucide React |
| Toasts | Sonner |
| PDF engine | qpdf CLI (bundled) |
| Desktop notifications | tauri-plugin-notification |
| Internationalization | Arabic + English |
| Tests | Vitest + happy-dom |

## Project Structure

```
qpdf-gui/
├── src/                    # Frontend (React + TypeScript)
│   ├── features/           # 13 page components
│   ├── components/         # Shared UI components
│   ├── hooks/              # useQpdf, useFilePicker, useFileSelection, useTheme
│   ├── i18n/               # Arabic + English translations
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types
├── src-tauri/              # Backend (Rust)
│   ├── resources/          # Bundled qpdf binaries (CI-downloaded)
│   └── src/
│       ├── commands/       # Tauri IPC commands
│       ├── services/       # qpdf CLI wrapper
│       └── models/         # Data models
└── package.json
```

## CI/CD

GitHub Actions builds for Linux (.deb, .rpm), Windows (.msi), and macOS (.dmg, Apple Silicon). Auto-update support via Tauri updater with signed releases.

## Tests

```bash
pnpm vitest run
```

27 tests covering validators, fileStore, and appStore.

## License

MIT

## Developer

Built by [Mostafa Mohamed](https://t.me/mrMostafaMo) — مصطفى محمد (Mostafa Mohamed)
