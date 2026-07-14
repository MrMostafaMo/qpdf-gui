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
} from "lucide-react"
import { OperationLogs } from "@/components/shared/OperationLogs"

const TOOLS = [
  { to: "/extract", icon: FileOutput, label: "Extract Pages", desc: "Pull pages from a PDF" },
  { to: "/merge", icon: Merge, label: "Merge PDFs", desc: "Combine multiple PDFs" },
  { to: "/split", icon: Scissors, label: "Split PDF", desc: "Split into parts" },
  { to: "/rotate", icon: RotateCw, label: "Rotate Pages", desc: "Rotate page orientation" },
  { to: "/delete", icon: Trash2, label: "Delete Pages", desc: "Remove pages" },
  { to: "/encrypt", icon: Lock, label: "Encrypt", desc: "Add password protection" },
  { to: "/decrypt", icon: Unlock, label: "Decrypt", desc: "Remove password" },
  { to: "/optimize", icon: Maximize2, label: "Optimize", desc: "Reduce file size" },
  { to: "/linearize", icon: Zap, label: "Linearize", desc: "Fast web viewing" },
  { to: "/info", icon: Info, label: "PDF Info", desc: "View file properties" },
  { to: "/batch", icon: Layers, label: "Batch Ops", desc: "Process multiple files" },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const recentFiles = useFileStore((s) => s.recentFiles)
  const clearRecentFiles = useFileStore((s) => s.clearRecentFiles)

  const handleDrop = () => {
    navigate("/info")
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Select a tool or drop a PDF to get started
        </p>
      </div>

      <DropZone onFilesSelected={handleDrop} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TOOLS.map(({ to, icon: Icon, label, desc }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {recentFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Recent Files</h2>
            <button
              onClick={clearRecentFiles}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear all
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
                  <span>{f.page_count} pages</span>
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
