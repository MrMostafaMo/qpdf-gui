import { useCallback, useState, useEffect } from "react"
import { Upload, FolderOpen } from "lucide-react"
import { getCurrentWebview } from "@tauri-apps/api/webview"
import { cn } from "@/lib/utils"
import { useFilePicker } from "@/hooks"
import { useI18n } from "@/i18n"

interface DropZoneProps {
  onFilesSelected: (paths: string[]) => void
  multiple?: boolean
  className?: string
}

export function DropZone({
  onFilesSelected,
  multiple = false,
  className,
}: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const { pickFiles } = useFilePicker()
  const t = useI18n()

  useEffect(() => {
    const unlisten = getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type === "over") {
        setDragOver(true)
      } else if (event.payload.type === "drop") {
        setDragOver(false)
        const pdfFiles = event.payload.paths.filter((p) =>
          p.toLowerCase().endsWith(".pdf"),
        )
        if (pdfFiles.length > 0) onFilesSelected(pdfFiles)
      } else {
        setDragOver(false)
      }
    })
    return () => {
      unlisten.then((fn) => fn())
    }
  }, [onFilesSelected])

  const handleBrowse = useCallback(async () => {
    const files = await pickFiles({ multiple })
    if (files) onFilesSelected(files)
  }, [pickFiles, multiple, onFilesSelected])

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        className,
      )}
    >
      <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
      <p className="mb-3 text-sm text-muted-foreground">
        {multiple ? t.shared.dropMultiple : t.shared.dropSingle}
      </p>
      <button
        onClick={handleBrowse}
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        {t.shared.browse}
      </button>
    </div>
  )
}
