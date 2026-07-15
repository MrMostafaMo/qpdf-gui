import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"
import { useI18n } from "@/i18n"

export default function RotatePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)
  const [angle, setAngle] = useState<90 | 180 | 270>(90)
  const [pages, setPages] = useState("")
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  useEffect(() => {
    if (pendingFile) { setFile(pendingFile); setPendingFile(null) }
  }, [])

  const handleDrop = (paths: string[]) => setFile(paths[0])
  const pagesValid = !pages || isValidPageRange(pages)

  const handleRotate = async () => {
    if (!file) return toast.error(t.rotate.errorFile)
    if (pages && !isValidPageRange(pages)) {
      toast.error(t.rotate.errorInvalid)
      return
    }
    startLoading()
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_rotated.pdf`)
    if (!outputPath) return

    await runWithToast("rotate_pages", {
      filePath: file,
      outputPath,
      angle,
      pages: pages || "all",
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
          <button
            key={a}
            onClick={() => setAngle(a as 90 | 180 | 270)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              angle === a
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {a}°
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder={t.rotate.placeholder}
        value={pages}
        onChange={(e) => setPages(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={handleRotate}
        disabled={loading || !file || !pagesValid}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? t.rotate.btnLoading : t.rotate.btnIdle}
      </button>
    </div>
  )
}
