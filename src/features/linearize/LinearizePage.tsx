import { useQpdf, useFileSelection } from "@/hooks"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { useI18n } from "@/i18n"

export default function LinearizePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { file, handleDrop, saveFile } = useFileSelection()
  const t = useI18n()

  const handleLinearize = async () => {
    if (!file) return toast.error(t.linearize.errorFile)
    startLoading()
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_linearized.pdf`)
    if (!outputPath) return

    await runWithToast("linearize_pdf", {
      filePath: file,
      outputPath,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.linearize.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.linearize.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.linearize.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <Button
        onClick={handleLinearize}
        disabled={loading || !file}
      >
        <Zap />
        {loading ? t.linearize.btnLoading : t.linearize.btnIdle}
      </Button>
    </div>
  )
}
