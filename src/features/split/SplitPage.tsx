import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save, FolderOpen } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"

export default function SplitPage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { pickDirectory } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)
  const [mode, setMode] = useState<"ranges" | "every">("ranges")
  const [pages, setPages] = useState("")
  const [interval, setInterval] = useState(1)
  const [outputDir, setOutputDir] = useState<string | null>(null)

  const handleDrop = (paths: string[]) => setFile(paths[0])
  const pagesValid = mode === "every" || !pages || isValidPageRange(pages)

  const handleSplit = async () => {
    if (!file) return toast.error("Select a PDF file")

    if (!outputDir) {
      const dir = await pickDirectory()
      if (!dir) return
      setOutputDir(dir)
    }

    const dir = outputDir ?? (await pickDirectory())
    if (!dir) return

    if (mode === "ranges") {
      if (!pages) return toast.error("Enter page range")
      if (!isValidPageRange(pages)) {
        toast.error("Invalid page range format (e.g. 1-5,8,10-12)")
        return
      }
      startLoading()
      await runWithToast("split_pdf", {
        filePath: file,
        outputDir: dir,
        mode: "ranges",
        ranges: pages,
      })
    } else {
      if (interval < 1) return toast.error("Interval must be at least 1")
      startLoading()
      await runWithToast("split_pdf", {
        filePath: file,
        outputDir: dir,
        mode: "every",
        interval,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message="Splitting file..." />
      <div>
        <h1 className="text-2xl font-bold">Split PDF</h1>
        <p className="text-sm text-muted-foreground">
          Split a PDF into separate files
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}

      <div className="flex gap-2">
        {(["ranges", "every"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {m === "ranges" ? "By Page Ranges" : "Every N Pages"}
          </button>
        ))}
      </div>

      {mode === "ranges" ? (
        <input
          type="text"
          placeholder="Pages (e.g. 1-5,8,10-12)"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Every
          </span>
          <input
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
          <span className="text-sm text-muted-foreground">
            page{interval !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={loading || !file || !pagesValid}
        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
      >
        <FolderOpen className="h-4 w-4" />
        {outputDir ? outputDir.split("/").pop() : "Choose output folder"}
      </button>
      {outputDir && (
        <p className="truncate text-xs text-muted-foreground">{outputDir}</p>
      )}

      <button
        onClick={handleSplit}
        disabled={loading || !file || !pagesValid}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? "Splitting..." : "Split PDF"}
      </button>
    </div>
  )
}
