import { DropZone } from "@/components/shared"
import { useFileStore } from "@/stores"
import { useNavigate } from "react-router-dom"
import {
  FileOutput,
  Merge,
  Scissors,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Maximize2,
  Zap,
  Info,
  Layers,
  X,
} from "lucide-react"
import { OperationLogs } from "@/components/shared/OperationLogs"
import { useI18n } from "@/i18n"

const TOOL_KEYS = [
  { to: "/info", icon: Info, key: "info" as const },
  { to: "/extract", icon: FileOutput, key: "extract" as const },
  { to: "/merge", icon: Merge, key: "merge" as const },
  { to: "/split", icon: Scissors, key: "split" as const },
  { to: "/rotate", icon: RotateCw, key: "rotate" as const },
  { to: "/delete", icon: Trash2, key: "delete" as const },
  { to: "/encrypt", icon: Lock, key: "encrypt" as const },
  { to: "/decrypt", icon: Unlock, key: "decrypt" as const },
  { to: "/optimize", icon: Maximize2, key: "optimize" as const },
  { to: "/linearize", icon: Zap, key: "linearize" as const },
  { to: "/batch", icon: Layers, key: "batch" as const },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const recentFiles = useFileStore((s) => s.recentFiles)
  const clearRecentFiles = useFileStore((s) => s.clearRecentFiles)
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  const handleDrop = (paths: string[]) => {
    setPendingFile(paths[0])
  }

  const handleToolSelect = (to: string) => {
    navigate(to)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.dashboard.subtitle}
        </p>
      </div>

      <DropZone onFilesSelected={handleDrop} />

      {pendingFile && (
        <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {t.dashboard.chooseToolFor}
            </p>
            <button
              onClick={() => setPendingFile(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="truncate text-xs text-muted-foreground">{pendingFile}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {TOOL_KEYS.map(({ to, icon: Icon, key }) => (
              <button
                key={to}
                onClick={() => handleToolSelect(to)}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{t.dashboard.tools[key].label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TOOL_KEYS.map(({ to, icon: Icon, key }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
            <div>
              <p className="text-sm font-medium">{t.dashboard.tools[key].label}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.tools[key].desc}</p>
            </div>
          </button>
        ))}
      </div>

      {recentFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">{t.dashboard.recentFiles}</h2>
            <button
              onClick={clearRecentFiles}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              {t.dashboard.clearAll}
            </button>
          </div>
          <div className="space-y-1">
            {recentFiles.map((f) => (
              <div
                key={f.file_path}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="truncate">{f.file_name}</span>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatSize(f.file_size)}</span>
                  <span>{f.page_count} {t.shared.pages}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <OperationLogs />
    </div>
  )
}
