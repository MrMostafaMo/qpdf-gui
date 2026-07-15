import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"
import { useI18n } from "@/i18n"

export default function DeletePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)
  const [pages, setPages] = useState("")
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  useEffect(() => {
    if (pendingFile) { setFile(pendingFile); setPendingFile(null) }
  }, [])

  const handleDrop = (paths: string[]) => setFile(paths[0])
  const pagesValid = !pages || isValidPageRange(pages)

  const handleDelete = async () => {
    if (!file || !pages) return toast.error(t.delete.errorNoFile)
    if (!isValidPageRange(pages)) {
      toast.error(t.delete.errorInvalid)
      return
    }
    startLoading()
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_pages_removed.pdf`)
    if (!outputPath) return

    await runWithToast("delete_pages", {
      filePath: file,
      pages,
      outputPath,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.delete.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.delete.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.delete.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <input
        type="text"
        placeholder={t.delete.placeholder}
        value={pages}
        onChange={(e) => setPages(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={handleDelete}
        disabled={loading || !file || !pages || !pagesValid}
        className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? t.delete.btnLoading : t.delete.btnIdle}
      </button>
    </div>
  )
}
