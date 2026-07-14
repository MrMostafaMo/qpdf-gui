import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Zap } from "lucide-react"

export default function LinearizePage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { saveFile } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)

  const handleDrop = (paths: string[]) => setFile(paths[0])

  const handleLinearize = async () => {
    if (!file) return toast.error("Select a PDF file")
    startLoading()
    const baseName = file.replace(/\.pdf$/i, "")
    const outputPath = await saveFile(`${baseName}_linearized.pdf`)
    if (!outputPath) return

    await runWithToast("linearize_pdf", {
      filePath: file,
      outputPath,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message="Linearizing PDF..." />
      <div>
        <h1 className="text-2xl font-bold">Linearize PDF</h1>
        <p className="text-sm text-muted-foreground">
          Optimize for fast web viewing with progressive rendering
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      <button
        onClick={handleLinearize}
        disabled={loading || !file}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Zap className="h-4 w-4" />
        {loading ? "Linearizing..." : "Save Linearized File"}
      </button>
    </div>
  )
}
