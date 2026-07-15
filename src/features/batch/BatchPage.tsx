import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save, FolderOpen } from "lucide-react"
import { useI18n } from "@/i18n"

export default function BatchPage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { pickDirectory } = useFilePicker()
  const [inputDir, setInputDir] = useState<string | null>(null)
  const [outputDir, setOutputDir] = useState<string | null>(null)
  const [operation, setOperation] = useState("optimize")
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  useEffect(() => {
    if (pendingFile) { setInputDir(pendingFile); setPendingFile(null) }
  }, [])

  const handleDrop = (paths: string[]) => setInputDir(paths[0])

  const handleBatch = async () => {
    if (!inputDir) return toast.error(t.batch.errorNoInput)
    if (!outputDir) {
      const dir = await pickDirectory()
      if (!dir) return
      setOutputDir(dir)
    }

    const outDir = outputDir ?? (await pickDirectory())
    if (!outDir) return
    startLoading()

    await runWithToast("batch_process", {
      inputDir,
      outputDir: outDir,
      operation,
    })
  }

  const ops = [
    { value: "optimize", label: t.batch.optimize },
    { value: "linearize", label: t.batch.linearize },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.batch.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.batch.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.batch.subtitle}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">{t.batch.inputDir}</p>
          <DropZone onFilesSelected={handleDrop} />
          {inputDir && (
            <p className="mt-2 truncate text-sm text-muted-foreground">
              {inputDir}
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{t.batch.outputDir}</p>
          <button
            onClick={async () => {
              const dir = await pickDirectory()
              if (dir) setOutputDir(dir)
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
          >
            <FolderOpen className="h-4 w-4" />
            {outputDir ? outputDir.split("/").pop() : t.shared.chooseOutputFolder}
          </button>
          {outputDir && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {outputDir}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{t.batch.operation}</p>
        <div className="flex gap-2">
          {ops.map((op) => (
            <button
              key={op.value}
              onClick={() => setOperation(op.value)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                operation === op.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleBatch}
        disabled={loading || !inputDir}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? t.batch.btnLoading : t.batch.btnIdle}
      </button>
    </div>
  )
}
