import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Save } from "lucide-react"
import { isValidPageRange } from "@/utils/validators"

export default function DeletePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)
  const [pages, setPages] = useState("")

  const handleDrop = (paths: string[]) => setFile(paths[0])
  const pagesValid = !pages || isValidPageRange(pages)

  const handleDelete = async () => {
    if (!file || !pages) return toast.error("Select a file and enter pages")
    if (!isValidPageRange(pages)) {
      toast.error("Invalid page range format (e.g. 1,3,5-7)")
      return
    }
    startLoading()
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_pages_removed.pdf`)
    if (!outputPath) return

    await runWithToast("delete_pages", {
      filePath: file,
      pages,
      outputPath,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message="Deleting pages..." />
      <div>
        <h1 className="text-2xl font-bold">Delete Pages</h1>
        <p className="text-sm text-muted-foreground">
          Remove specific pages from a PDF
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <input
        type="text"
        placeholder="Pages to delete (e.g. 1,3,5-7)"
        value={pages}
        onChange={(e) => setPages(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={handleDelete}
        disabled={loading || !file || !pages || !pagesValid}
        className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? "Deleting..." : "Save Without Pages"}
      </button>
    </div>
  )
}
