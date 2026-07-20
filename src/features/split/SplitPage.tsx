import { useQpdf, useFileSelection } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Save, FolderOpen } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"
import { useI18n } from "@/i18n"

export default function SplitPage() {
  const { loading, runWithToast } = useQpdf()
  const { file, handleDrop, pickDirectory } = useFileSelection()
  const [mode, setMode] = useState<"ranges" | "every">("ranges")
  const [pages, setPages] = useState("")
  const [chunkSize, setChunkSize] = useState(1)
  const [outputDir, setOutputDir] = useState<string | null>(null)
  const t = useI18n()

  const pagesValid =
    mode === "every"
      ? chunkSize >= 1
      : !!pages && isValidPageRange(pages)

  const handleSplit = async () => {
    if (!file) return toast.error(t.split.errorFile)

    let dir = outputDir
    if (!dir) {
      dir = await pickDirectory()
      if (!dir) return
      setOutputDir(dir)
    }

    if (mode === "ranges") {
      if (!pages) return toast.error(t.split.rangeError)
      if (!isValidPageRange(pages)) {
        toast.error(t.split.errorInvalid)
        return
      }
      await runWithToast("split_pdf", {
        filePath: file,
        outputDir: dir,
        mode: "ranges",
        ranges: pages,
      })
    } else {
      if (chunkSize < 1) return toast.error(t.split.intervalError)
      await runWithToast("split_pdf", {
        filePath: file,
        outputDir: dir,
        mode: "every",
        interval: chunkSize,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.split.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.split.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.split.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}

      <div className="flex gap-2">
        {(["ranges", "every"] as const).map((m) => (
          <Button
            key={m}
            onClick={() => setMode(m)}
            variant={mode === m ? "default" : "secondary"}
          >
            {m === "ranges" ? t.split.byRanges : t.split.everyN}
          </Button>
        ))}
      </div>

      {mode === "ranges" ? (
        <input
          type="text"
          placeholder={t.split.placeholder}
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          aria-label={t.split.placeholder}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {t.split.every}
          </span>
          <input
            type="number"
            min={1}
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value) || 1)}
            aria-label={t.split.everyN}
            className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
          <span className="text-sm text-muted-foreground">
            {chunkSize !== 1 ? t.shared.pages : t.shared.page}
          </span>
        </div>
      )}

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
        <p className="truncate text-xs text-muted-foreground">{outputDir}</p>
      )}

      <Button
        onClick={handleSplit}
        disabled={loading || !file || !pagesValid}
      >
        <Save />
        {loading ? t.split.btnLoading : t.split.btnIdle}
      </Button>
    </div>
  )
}
