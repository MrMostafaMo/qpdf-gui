import { useQpdf, useFileSelection } from "@/hooks"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Save, X, ArrowUp, ArrowDown } from "lucide-react"
import { useI18n } from "@/i18n"

export default function MergePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { files, setFiles, handleDrop, saveFile } = useFileSelection(true)
  const t = useI18n()

  const swap = (i: number, j: number) =>
    setFiles((p) => {
      const next = [...p]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error(t.merge.errorMin)
      return
    }
    startLoading()
    const outputPath = await saveFile("merged.pdf")
    if (!outputPath) return

    await runWithToast("merge_pdfs", {
      filePaths: files,
      outputPath,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.merge.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.merge.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.merge.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} multiple />
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="truncate flex-1 text-muted-foreground">
                {f.split("/").pop()}
              </span>
              <Button
                onClick={() => swap(i, i - 1)}
                disabled={i === 0}
                variant="ghost"
                size="icon-xs"
              >
                <ArrowUp />
              </Button>
              <Button
                onClick={() => swap(i, i + 1)}
                disabled={i === files.length - 1}
                variant="ghost"
                size="icon-xs"
              >
                <ArrowDown />
              </Button>
              <Button
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                variant="ghost"
                size="icon-xs"
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {files.length} {files.length !== 1 ? t.shared.filesSelected : t.shared.fileSelected}
      </p>
      <Button
        onClick={handleMerge}
        disabled={loading || files.length < 2}
      >
        <Save />
        {loading ? t.merge.btnLoading : t.merge.btnIdle}
      </Button>
    </div>
  )
}
