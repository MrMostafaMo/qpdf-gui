import { useQpdf, useFileSelection } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"
import { useI18n } from "@/i18n"

export default function ExtractPage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { file, handleDrop, saveFile } = useFileSelection()
  const [pages, setPages] = useState("")
  const t = useI18n()

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
      <Button
        onClick={handleExtract}
        disabled={loading || !file || !pages || !pagesValid}
      >
        <Save />
        {loading ? t.extract.btnLoading : t.extract.btnIdle}
      </Button>
    </div>
  )
}
