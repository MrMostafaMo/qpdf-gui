import { FileText } from "lucide-react"
import { formatFileSize, formatPageCount } from "@/utils/format"

interface FileCardProps {
  fileName: string
  fileSize: number
  pageCount: number
  onRemove?: () => void
}

export function FileCard({
  fileName,
  fileSize,
  pageCount,
  onRemove,
}: FileCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <FileText className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileSize)} · {formatPageCount(pageCount)}
        </p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Remove
        </button>
      )}
    </div>
  )
}
