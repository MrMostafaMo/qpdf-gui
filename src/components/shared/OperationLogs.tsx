import { create } from "zustand"
import { persist } from "zustand/middleware"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { useI18n } from "@/i18n"

export interface LogEntry {
  id: string
  operation: string
  inputFile: string
  outputFile?: string
  status: "running" | "success" | "error"
  message?: string
  timestamp: number
}

interface LogState {
  entries: LogEntry[]
  addEntry: (entry: Omit<LogEntry, "id" | "timestamp">) => string
  updateEntry: (id: string, update: Partial<LogEntry>) => void
  clearLogs: () => void
}

export const useLogStore = create<LogState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => {
        const id = crypto.randomUUID()
        set((s) => ({
          entries: [
            { ...entry, id, timestamp: Date.now() },
            ...s.entries,
          ].slice(0, 100),
        }))
        return id
      },
      updateEntry: (id, update) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...update } : e)),
        })),
      clearLogs: () => set({ entries: [] }),
    }),
    { name: "qpdf-operation-logs" },
  ),
)

const STATUS_ICONS = {
  running: <Clock className="h-4 w-4 text-muted-foreground animate-spin" />,
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
}

const OPERATION_NAMES: Record<string, string> = {
  extract_pages: "extract",
  merge_pdfs: "merge",
  split_pdf: "split",
  rotate_pages: "rotate",
  delete_pages: "delete",
  encrypt_pdf: "encrypt",
  decrypt_pdf: "decrypt",
  optimize_pdf: "optimize",
  linearize_pdf: "linearize",
  batch_process: "batch",
}

export function OperationLogs() {
  const { entries, clearLogs } = useLogStore()
  const t = useI18n()

  if (entries.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h3 className="text-xs font-medium uppercase text-muted-foreground">
          {t.shared.operationLog}
        </h3>
        <button
          onClick={clearLogs}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t.shared.clear}
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 border-b border-border/50 px-4 py-2 last:border-0"
          >
            {STATUS_ICONS[entry.status]}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium">{t.nav[OPERATION_NAMES[entry.operation] as keyof typeof t.nav] || entry.operation}</p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.inputFile}
                {entry.outputFile && ` → ${entry.outputFile}`}
              </p>
              {entry.message && (
                <p className="text-xs text-muted-foreground">{entry.message}</p>
              )}
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
