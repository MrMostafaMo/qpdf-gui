import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Minimize2 } from "lucide-react"

export default function OptimizePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)
  const [level, setLevel] = useState("generalized")

  const handleDrop = (paths: string[]) => setFile(paths[0])

  const handleOptimize = async () => {
    if (!file) return toast.error("Select a PDF file")
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
      <ProgressOverlay loading={loading} message="Optimizing PDF..." />
      <div>
        <h1 className="text-2xl font-bold">Optimize PDF</h1>
        <p className="text-sm text-muted-foreground">
          Reduce PDF file size with quality presets
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <div className="space-y-2">
        {[
          { value: "generalized", label: "Generalized", desc: "Balanced compression (default)" },
          { value: "all", label: "All", desc: "Maximum compression" },
          { value: "specialized", label: "Specialized", desc: "Minimal changes" },
          { value: "none", label: "None", desc: "No recompression" },
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
        {loading ? "Optimizing..." : "Save Optimized File"}
      </button>
    </div>
  )
}
