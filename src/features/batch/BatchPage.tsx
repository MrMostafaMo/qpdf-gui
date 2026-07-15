import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Button } from "@/components/ui/button"
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
          <Button
            onClick={async () => {
              const dir = await pickDirectory()
              if (dir) setOutputDir(dir)
            }}
            variant="outline"
          >
            <FolderOpen />
            {outputDir ? outputDir.split("/").pop() : t.shared.chooseOutputFolder}
          </Button>
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
            <Button
              key={op.value}
              onClick={() => setOperation(op.value)}
              variant={operation === op.value ? "default" : "secondary"}
            >
              {op.label}
            </Button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleBatch}
        disabled={loading || !inputDir}
      >
        <Save />
        {loading ? t.batch.btnLoading : t.batch.btnIdle}
      </Button>
    </div>
  )
}
