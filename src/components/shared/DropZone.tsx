import { useCallback, useState } from "react"
import { Upload, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFilePicker } from "@/hooks"

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files)
        .filter((f) => f.name.toLowerCase().endsWith(".pdf"))
        .map((f) => (f as unknown as { path: string }).path)
      if (files.length > 0) onFilesSelected(files)
    },
    [onFilesSelected],
  )

  const handleBrowse = useCallback(async () => {
    const files = await pickFiles({ multiple })
    if (files) onFilesSelected(files)
  }, [pickFiles, multiple, onFilesSelected])

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
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
        Drop PDF file{multiple ? "s" : ""} here
      </p>
      <button
        onClick={handleBrowse}
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        Browse files
      </button>
    </div>
  )
}
