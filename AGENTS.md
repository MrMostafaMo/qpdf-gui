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
| PDF engine | `qpdf` CLI (bundled, shelled out via `std::process::Command`) |
| Desktop notifications | `tauri-plugin-notification` |
| Internationalization | Arabic + English via `useI18n()` hook |
| Linter | oxlint |
| Tests | Vitest + happy-dom + @testing-library/react |

## Project Structure

```
qpdf-gui/
├── src/                          # Frontend
│   ├── App.tsx                   # Router: single <AppLayout> + <Outlet>
│   ├── index.css                 # Tailwind + shadcn theme + keyframes
│   ├── components/
│   │   ├── layout/               # AppLayout, Sidebar, Header
│   │   ├── shared/               # DropZone, ProgressOverlay, ProgressBar, OperationLogs
│   │   └── ui/                   # shadcn Button
│   ├── features/                 # 13 page components (one per route)
│   ├── hooks/                    # useQpdf, useFilePicker, useFileSelection, useTheme
│   ├── i18n/                     # locales/en.ts, locales/ar.ts, index.ts
│   ├── stores/                   # appStore, fileStore, settingsStore, loadingStore
│   ├── types/                    # PdfInfo, OperationResult, Settings
│   └── utils/                    # format.ts, validators.ts
├── src-tauri/                    # Backend
│   ├── icons/                    # App icons (generated from logo.png)
│   ├── resources/                # Bundled qpdf binaries + shared libs (CI-downloaded, gitignored)
│   ├── src/
│   │   ├── commands/mod.rs       # 11 Tauri commands
│   │   ├── services/qpdf.rs      # QpdfService — resolves bundled qpdf, shells out to `qpdf` CLI
│   │   ├── models/mod.rs         # PdfInfo, OperationResult structs
│   │   └── utils/error.rs        # AppError enum
│   ├── capabilities/default.json # Plugin permissions
│   └── tauri.conf.json           # Window: 1200x800, min 900x600, bundled resources
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
  → notification              [if window not focused]
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
| `fileStore` | None (memory) | `recentFiles[]`, `pendingFile` |
| `settingsStore` | `tauri-plugin-store` (`settings.json`) | `default_output_dir`, `overwrite_existing`, `theme`, `remember_recent_files`, `max_recent_files`, `language` |
| `useLogStore` | `zustand/persist` (localStorage) | `entries[]` (max 100) |
| `loadingStore` | None (memory) | `loading` — global loading state for ProgressBar |

## Hooks

| Hook | Purpose |
|------|---------|
| `useQpdf` | `{ loading, run, runWithToast, startLoading }` — invoke wrapper with toast + log + global loading state + desktop notification (when unfocused) |
| `useFilePicker` | `{ pickFiles, pickDirectory, saveFile }` — dialog wrappers (respects `default_output_dir`) |
| `useFileSelection` | `{ file, files, handleDrop, saveFile, pickDirectory }` — pendingFile sync + file state + drag-drop |
| `useTheme` | `{ theme, setTheme }` — syncs theme to `document.documentElement.classList` |
| `useI18n` | Returns translations object for current language (Arabic/English) |

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard (tool grid + recent files + logs) |
| `/extract` | Extract Pages (with page range validation) |
| `/merge` | Merge PDFs (multi-file, reorderable) |
| `/split` | Split PDF (ranges or every N pages, with validation) |
| `/rotate` | Rotate Pages (with optional page range validation) |
| `/delete` | Delete Pages (with page range validation) |
| `/encrypt` | Encrypt PDF (multi-file, bulk encrypt with output dir) |
| `/decrypt` | Decrypt PDF (multi-file, bulk decrypt with output dir) |
| `/optimize` | Optimize PDF (shows before/after size comparison) |
| `/linearize` | Linearize PDF |
| `/info` | PDF Info (open in system viewer) |
| `/batch` | Batch Operations (folder-based) |
| `/settings` | Settings (language, output dir, developer info) |

## Internationalization

- Two locales: English (`src/i18n/locales/en.ts`) and Arabic (`src/i18n/locales/ar.ts`)
- Language persisted in `settingsStore.language`
- RTL support: `document.documentElement.dir` toggles in `App.tsx`, Sidebar uses logical `ms-*` properties
- All components use `useI18n()` hook to get `t()` translations

## Desktop Notifications

- Uses `tauri-plugin-notification` + `@tauri-apps/plugin-notification`
- Fires system notification only when window is **not focused** (`!isFocused()`)
- When app is open and focused, only Sonner toasts are shown
- Integrated into `useQpdf().runWithToast()` — all 10 feature operations inherit this behavior

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

## CI/CD

### GitHub Actions
- Workflow: `.github/workflows/build.yml`
- Matrix: Linux x86_64 (ubuntu-24.04, .deb + .rpm), Linux ARM64 (ubuntu-24.04-arm, .deb + .rpm), Windows (windows-latest, .msi), macOS (macos-14 Apple Silicon, .dmg)
- qpdf is bundled: CI downloads prebuilt binaries (Linux/Windows) or compiles from source (macOS)
- Auto-update: signing key in `src-tauri/updater.key` (gitignored), GitHub releases with `latest.json`
- **Note:** GitHub Actions may be disabled due to billing — build locally if CI fails

### GitLab CI
- Pipeline: `.gitlab-ci.yml`
- Linux x86_64: runs on GitLab shared runners
- Linux ARM64, Windows, macOS: require self-hosted runners (optional, `allow_failure: true`)

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
- Each file gets its own OperationLog entry with per-file progress

## Tests

- Framework: Vitest + happy-dom + @testing-library/react
- Run: `pnpm vitest run`
- `src/utils/__tests__/validators.test.ts` — 10 tests
- `src/stores/__tests__/fileStore.test.ts` — 7 tests
- `src/stores/__tests__/appStore.test.ts` — 4 tests

## Versioning

To release a new version, bump the version in ALL THREE places:
1. `package.json` — `"version"`
2. `src-tauri/tauri.conf.json` — `"version"`
3. `src-tauri/Cargo.toml` — `version`

Then commit, tag, and push:
```bash
git tag v<VERSION> && git push origin v<VERSION>
```

**The git tag alone does NOT set the installer version** — it only triggers CI to create a release. The installer filename and metadata come from the three files above.

## Adding a New Command

1. **Rust:** Add function in `src-tauri/src/commands/mod.rs` with `#[tauri::command]`
2. **Register:** Add to `tauri::generate_handler![]` in `src-tauri/src/lib.rs`
3. **Page:** Create in `src/features/<name>/<Name>Page.tsx` using `useQpdf().runWithToast()`
4. **Route:** Add `<Route>` in `src/App.tsx`
5. **Sidebar:** Add nav item in `src/components/layout/Sidebar.tsx`

## Known Limitations

- No PDF viewer/renderer — manipulate only
- qpdf is bundled with the app (no separate install needed)
- macOS build is Apple Silicon (arm64), not universal binary
- Windows build is x86_64 only

## Releases

- **GitHub:** https://github.com/MrMostafaMo/qpdf-gui/releases
- **GitLab:** https://gitlab.com/mrmostafa/qpdf-gui/-/releases
- **Current:** v1.3.0

## GitLab

- **URL:** https://gitlab.com/mrmostafa/qpdf-gui
- **Remote:** `gitlab` (`git remote add gitlab https://gitlab.com/mrmostafa/qpdf-gui.git`)

### GitLab Push Rule

**DO NOT** push to GitLab without explicit user permission. Always ask before `git push gitlab`.
After every edit to any file, show the user and ask if they want to push to GitLab.
