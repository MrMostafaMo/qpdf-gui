import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"
import { useI18n } from "@/i18n"

export default function ExtractPage() {
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

  const handleExtract = async () => {
    if (!file || !pages) {
      toast.error(t.extract.errorNoFile)
      return
    }
    if (!isValidPageRange(pages)) {
      toast.error(t.extract.errorInvalid)
      return
    }
    startLoading()
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_extracted.pdf`)
    if (!outputPath) return

    await runWithToast("extract_pages", {
      filePath: file,
      pages,
      outputPath,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.extract.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.extract.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.extract.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <input
        type="text"
        placeholder={t.extract.placeholder}
        value={pages}
        onChange={(e) => setPages(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={handleExtract}
        disabled={loading || !file || !pages || !pagesValid}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? t.extract.btnLoading : t.extract.btnIdle}
      </button>
    </div>
  )
}
