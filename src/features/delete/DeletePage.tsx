import { useQpdf, useFileSelection } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"
import { useI18n } from "@/i18n"

export default function DeletePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { file, handleDrop, saveFile } = useFileSelection()
  const [pages, setPages] = useState("")
  const t = useI18n()

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
      <Button
        onClick={handleDelete}
        disabled={loading || !file || !pages || !pagesValid}
        variant="destructive"
      >
        <Save />
        {loading ? t.delete.btnLoading : t.delete.btnIdle}
      </Button>
    </div>
  )
}
