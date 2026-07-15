import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save, X } from "lucide-react"
import { useI18n } from "@/i18n"

export default function MergePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [files, setFiles] = useState<string[]>([])
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  useEffect(() => {
    if (pendingFile) { setFiles((p) => [...p, pendingFile]); setPendingFile(null) }
  }, [])

  const handleDrop = (paths: string[]) =>
    setFiles((prev) => [...prev, ...paths])

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error(t.merge.errorMin)
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
      <ProgressOverlay loading={loading} message={t.merge.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.merge.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.merge.subtitle}
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
        {files.length} {files.length !== 1 ? t.shared.filesSelected : t.shared.fileSelected}
      </p>
      <button
        onClick={handleMerge}
        disabled={loading || files.length < 2}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? t.merge.btnLoading : t.merge.btnIdle}
      </button>
    </div>
  )
}
