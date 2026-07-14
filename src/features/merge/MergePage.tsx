import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save, X } from "lucide-react"

export default function MergePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [files, setFiles] = useState<string[]>([])

  const handleDrop = (paths: string[]) =>
    setFiles((prev) => [...prev, ...paths])

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Select at least 2 PDF files")
      return
    }
    startLoading()
    const outputPath = await saveFile("merged.pdf")
    if (!outputPath) return

    await runWithToast("merge_pdfs", {
      filePaths: files,
      outputPath,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message="Merging files..." />
      <div>
        <h1 className="text-2xl font-bold">Merge PDFs</h1>
        <p className="text-sm text-muted-foreground">
          Combine multiple PDF files into one
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} multiple />
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="truncate flex-1 text-muted-foreground">
                {f.split("/").pop()}
              </span>
              <button
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {files.length} file{files.length !== 1 ? "s" : ""} selected
      </p>
      <button
        onClick={handleMerge}
        disabled={loading || files.length < 2}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? "Merging..." : "Save Merged File"}
      </button>
    </div>
  )
}
