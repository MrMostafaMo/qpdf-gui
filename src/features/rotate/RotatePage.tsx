import { useQpdf, useFileSelection } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"
import { useI18n } from "@/i18n"

export default function RotatePage() {
  const { loading, runWithToast } = useQpdf()
  const { file, handleDrop, saveFile } = useFileSelection()
  const [angle, setAngle] = useState<90 | 180 | 270>(90)
  const [pages, setPages] = useState("")
  const t = useI18n()
  const pagesValid = !pages || isValidPageRange(pages)

  const handleRotate = async () => {
    if (!file) return toast.error(t.rotate.errorFile)
    if (pages && !isValidPageRange(pages)) {
      toast.error(t.rotate.errorInvalid)
      return
    }
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_rotated.pdf`)
    if (!outputPath) return

    await runWithToast("rotate_pages", {
      filePath: file,
      outputPath,
      angle,
      pages: pages || "1-end",
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.rotate.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.rotate.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.rotate.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <div className="flex gap-2">
        {[90, 180, 270].map((a) => (
          <Button
            key={a}
            onClick={() => setAngle(a as 90 | 180 | 270)}
            variant={angle === a ? "default" : "secondary"}
          >
            {a}°
          </Button>
        ))}
      </div>
      <input
        type="text"
        placeholder={t.rotate.placeholder}
        value={pages}
        onChange={(e) => setPages(e.target.value)}
        aria-label={t.rotate.placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <Button
        onClick={handleRotate}
        disabled={loading || !file || !pagesValid}
      >
        <Save />
        {loading ? t.rotate.btnLoading : t.rotate.btnIdle}
      </Button>
    </div>
  )
}
