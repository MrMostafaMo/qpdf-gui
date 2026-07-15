# QPDF GUI

Cross-platform desktop PDF toolbox powered by `qpdf` CLI.
Tauri v2 (Rust) + React 19 + TypeScript + TailwindCSS v4.

## Quick Start

```bash
# System dependencies (Linux)
sudo dnf install gtk3 webkit2gtk4.1  # or apt equivalent

# Dev
pnpm install
pnpm tauri dev

# Build
pnpm tauri build
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop runtime | Tauri v2.11 (Rust) |
| Frontend | React 19, TypeScript 6, Vite 8 |
| Styling | TailwindCSS v4, shadcn/ui (base-nova) |
| State | Zustand 5 (in-memory + tauri-plugin-store for settings) |
| Routing | React Router v7 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Toasts | Sonner |
| PDF engine | `qpdf` CLI (shelled out via `std::process::Command`) |
| Linter | oxlint |

## Project Structure

```
qpdf-gui/
├── src/                          # Frontend
│   ├── App.tsx                   # Router: single <AppLayout> + <Outlet>
│   ├── index.css                 # Tailwind + shadcn theme + keyframes
│   ├── components/
│   │   ├── layout/               # AppLayout, Sidebar, Header
│   │   ├── shared/               # DropZone, FileCard, EmptyState, ProgressOverlay, ProgressBar, OperationLogs
│   │   └── ui/                   # shadcn Button
│   ├── features/                 # 13 page components (one per route)
│   ├── hooks/                    # useQpdf, useFilePicker, useTheme
│   ├── stores/                   # appStore, fileStore, settingsStore, loadingStore
│   ├── types/                    # PdfInfo, OperationResult, Settings
│   └── utils/                    # format.ts, validators.ts
├── src-tauri/                    # Backend
│   ├── icons/                    # App icons (generated from logo.png)
│   ├── src/
│   │   ├── commands/mod.rs       # 11 Tauri commands
│   │   ├── services/qpdf.rs      # QpdfService — shells out to `qpdf`
│   │   ├── models/mod.rs         # PdfInfo, OperationResult structs
│   │   └── utils/error.rs        # AppError enum
│   ├── capabilities/default.json # Plugin permissions
│   └── tauri.conf.json           # Window: 1200x800, min 900x600
├── logo.png                      # Source image for app icon
└── package.json
```

## Architecture

### Data Flow
```
User → Feature Page → useQpdf().runWithToast(cmd, args)
  → invoke(cmd, args)        [Tauri IPC]
  → #[tauri::command] fn     [Rust]
  → QpdfService.method()     [shells out to `qpdf` CLI]
  → OperationResult           [returned to JS]
  → toast + OperationLog      [UI feedback]
```

### Key Convention: camelCase ↔ snake_case
Tauri v2 auto-renames Rust bare params (`file_path`) to camelCase (`filePath`) on the JS side.
- **Frontend sends camelCase** (e.g. `filePath`, `outputPath`, `outputDir`)
- **Rust receives snake_case** (e.g. `file_path`, `output_path`, `output_dir`)
- **Rust response uses snake_case** (e.g. `OperationResult.output_path`)
- Do NOT wrap args in `{ req: ... }` — send bare params directly to `invoke()`

## Commands

| Command | Params (camelCase for JS) | Returns |
|---------|---------------------------|---------|
| `get_pdf_info` | `filePath` | `PdfInfo` |
| `extract_pages` | `filePath, pages, outputPath` | `OperationResult` |
| `merge_pdfs` | `filePaths[], outputPath` | `OperationResult` |
| `split_pdf` | `filePath, outputDir, mode, ranges?, interval?` | `OperationResult` |
| `rotate_pages` | `filePath, pages, angle, outputPath` | `OperationResult` |
| `delete_pages` | `filePath, pages, outputPath` | `OperationResult` |
| `encrypt_pdf` | `filePath, outputPath, ownerPassword, userPassword, keyLength` | `OperationResult` |
| `decrypt_pdf` | `filePath, outputPath, password` | `OperationResult` |
| `optimize_pdf` | `filePath, outputPath, level` | `OperationResult` |
| `linearize_pdf` | `filePath, outputPath` | `OperationResult` |
| `batch_process` | `inputDir, outputDir, operation` | `OperationResult` |

### Split Modes
- `"ranges"` — comma-separated page ranges (e.g. `"1-5,8,10-12"`), creates one PDF per range
- `"every"` — splits into chunks of `interval` pages

### Optimize Levels
`"generalized"` (balanced, default), `"all"` (maximum compression), `"specialized"` (minimal changes), `"none"` (no recompression)

### Batch Operations
`"optimize"` and `"linearize"` only. Iterates all `.pdf` files in `inputDir`, writes `{name}_{operation}.pdf` to `outputDir`.

## Stores

| Store | Persistence | Key Fields |
|-------|-------------|------------|
| `appStore` | None (memory) | `sidebarCollapsed`, `theme` |
| `fileStore` | None (memory) | `currentFile`, `recentFiles` |
| `settingsStore` | `tauri-plugin-store` (`settings.json`) | `default_output_dir`, `overwrite_existing`, `theme`, `remember_recent_files`, `max_recent_files` |
| `logStore` | `zustand/persist` (localStorage) | `entries[]` (max 100) |
| `loadingStore` | None (memory) | `loading` — global loading state for ProgressBar |

## Hooks

| Hook | Purpose |
|------|---------|
| `useQpdf` | `{ loading, run, runWithToast }` — invoke wrapper with toast + log + global loading state |
| `useFilePicker` | `{ pickFiles, pickDirectory, saveFile }` — dialog wrappers |
| `useTheme` | `{ theme, setTheme }` — syncs theme to `document.documentElement.classList` |

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard (tool grid + recent files + logs) |
| `/extract` | Extract Pages (with page range validation) |
| `/merge` | Merge PDFs (multi-file) |
| `/split` | Split PDF (ranges or every N pages, with validation) |
| `/rotate` | Rotate Pages (with optional page range validation) |
| `/delete` | Delete Pages (with page range validation) |
| `/encrypt` | Encrypt PDF (multi-file, bulk encrypt with output dir) |
| `/decrypt` | Decrypt PDF (multi-file, bulk decrypt with output dir) |
| `/optimize` | Optimize PDF |
| `/linearize` | Linearize PDF |
| `/info` | PDF Info |
| `/batch` | Batch Operations (folder-based) |
| `/settings` | Settings |

## Input Validation

Pages with text input for page ranges use `isValidPageRange()` from `src/utils/validators.ts`:
- **Extract, Delete** — page range required and validated before submit
- **Rotate** — page range optional, but validated if provided
- **Split** — page range validated when mode is `"ranges"`
- **Encrypt** — button disabled when passwords don't match

Validation pattern:
```ts
import { isValidPageRange } from "@/utils/validators"
const pagesValid = !pages || isValidPageRange(pages)
// Button: disabled={loading || !file || !pages || !pagesValid}
// Handler: if (!isValidPageRange(pages)) { toast.error("..."); return }
```

## Bulk Operations

Encrypt and Decrypt support multiple files:
- DropZone uses `multiple` prop
- State is `string[]` (files array) with remove buttons
- Uses `pickDirectory()` for output dir (not save dialog per file)
- Loops over files, calling the single-file command per file
- Each file gets its own OperationLog entry

## Adding a New Command

1. **Rust:** Add function in `src-tauri/src/commands/mod.rs` with `#[tauri::command]`
2. **Register:** Add to `tauri::generate_handler![]` in `src-tauri/src/lib.rs`
3. **Page:** Create in `src/features/<name>/<Name>Page.tsx` using `useQpdf().runWithToast()`
4. **Route:** Add `<Route>` in `src/App.tsx`
5. **Sidebar:** Add nav item in `src/components/layout/Sidebar.tsx`

## Known Limitations

- No PDF viewer/renderer — manipulate only
- qpdf is bundled with the app (no separate install needed)
- No test suite
