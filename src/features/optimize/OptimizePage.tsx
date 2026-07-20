import { useQpdf, useFileSelection } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Minimize2 } from "lucide-react"
import { useI18n } from "@/i18n"
import { formatFileSize } from "@/utils/format"
import { stat } from "@tauri-apps/plugin-fs"

export default function OptimizePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { file, handleDrop, saveFile } = useFileSelection()
  const [level, setLevel] = useState("generalized")
  const [result, setResult] = useState<{ before: number; after: number } | null>(null)
  const t = useI18n()

  const handleOptimize = async () => {
    if (!file) return toast.error(t.optimize.errorFile)
    setResult(null)
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_optimized.pdf`)
    if (!outputPath) return
    startLoading()

    try {
      const beforeSize = (await stat(file)).size
      const op = await runWithToast("optimize_pdf", {
        filePath: file,
        outputPath,
        level,
      })
      if (op.success) {
        const afterSize = (await stat(outputPath)).size
        setResult({ before: beforeSize, after: afterSize })
      }
    } catch {
      // stat or invoke failure — runWithToast already shows error
    }
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
      <Button
        onClick={handleOptimize}
        disabled={loading || !file}
      >
        <Minimize2 />
        {loading ? t.optimize.btnLoading : t.optimize.btnIdle}
      </Button>
      {result && (
        <div className="rounded-md border border-border bg-card p-4 text-sm">
          <p className="mb-1 font-medium">{t.shared.result}</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{t.shared.before}: {formatFileSize(result.before)}</span>
            <span>{t.shared.after}: {formatFileSize(result.after)}</span>
            <span className={result.after <= result.before ? "text-green-600" : "text-red-600"}>
              {result.after <= result.before ? "−" : "+"}
              {formatFileSize(Math.abs(result.before - result.after))}
              {" "}({((1 - result.after / result.before) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
