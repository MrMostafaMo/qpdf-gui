import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Minimize2 } from "lucide-react"
import { useI18n } from "@/i18n"

export default function OptimizePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)
  const [level, setLevel] = useState("generalized")
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  useEffect(() => {
    if (pendingFile) { setFile(pendingFile); setPendingFile(null) }
  }, [])

  const handleDrop = (paths: string[]) => setFile(paths[0])

  const handleOptimize = async () => {
    if (!file) return toast.error(t.optimize.errorFile)
    startLoading()
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_optimized.pdf`)
    if (!outputPath) return

    await runWithToast("optimize_pdf", {
      filePath: file,
      outputPath,
      level,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.optimize.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.optimize.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.optimize.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <div className="space-y-2">
        {[
          { value: "generalized", label: t.optimize.generalized, desc: t.optimize.generalizedDesc },
          { value: "all", label: t.optimize.all, desc: t.optimize.allDesc },
          { value: "specialized", label: t.optimize.specialized, desc: t.optimize.specializedDesc },
          { value: "none", label: t.optimize.none, desc: t.optimize.noneDesc },
        ].map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${
              level === opt.value
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="level"
              value={opt.value}
              checked={level === opt.value}
              onChange={(e) => setLevel(e.target.value)}
              className="accent-primary"
            />
            <div>
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={handleOptimize}
        disabled={loading || !file}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Minimize2 className="h-4 w-4" />
        {loading ? t.optimize.btnLoading : t.optimize.btnIdle}
      </button>
    </div>
  )
}
