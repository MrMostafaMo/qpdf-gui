# QPDF GUI

Cross-platform desktop PDF toolbox powered by [qpdf](https://qpdf.readthedocs.io/).

Built with **Tauri v2** (Rust) + **React 19** + **TypeScript** + **TailwindCSS v4**.

## Features

| Operation | Description |
|-----------|-------------|
| Extract Pages | Pull specific pages from a PDF into a new file |
| Merge PDFs | Combine multiple PDF files into one |
| Split PDF | Split into separate files by page ranges or every N pages |
| Rotate Pages | Rotate pages by 90, 180, or 270 degrees |
| Delete Pages | Remove specific pages from a PDF |
| Encrypt PDF | Add password protection (AES-256) |
| Decrypt PDF | Remove password protection |
| Optimize PDF | Reduce file size with quality presets |
| Linearize PDF | Optimize for fast web viewing |
| PDF Info | View metadata and file properties |
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

## Project Structure

```
qpdf-gui/
├── src/                    # Frontend (React + TypeScript)
│   ├── features/           # 13 page components
│   ├── components/         # Shared UI components
│   ├── hooks/              # useQpdf, useFilePicker, useTheme
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types
├── src-tauri/              # Backend (Rust)
│   └── src/
│       ├── commands/       # Tauri IPC commands
│       ├── services/       # qpdf CLI wrapper
│       └── models/         # Data models
└── package.json
```

## License

MIT
