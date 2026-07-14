import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Unlock, X, FolderOpen } from "lucide-react"

export default function DecryptPage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { pickDirectory } = useFilePicker()
  const [files, setFiles] = useState<string[]>([])
  const [password, setPassword] = useState("")
  const [outputDir, setOutputDir] = useState<string | null>(null)

  const handleDrop = (paths: string[]) =>
    setFiles((prev) => [...prev, ...paths])

  const handleDecrypt = async () => {
    if (files.length === 0) return toast.error("Select PDF files")
    if (!password) return toast.error("Enter a password")

    let dir = outputDir
    if (!dir) {
      dir = await pickDirectory()
      if (!dir) return
      setOutputDir(dir)
    }
    startLoading()

    for (const f of files) {
      const name = f.split("/").pop()?.replace(/\.pdf$/i, "") || "file"
      await runWithToast("decrypt_pdf", {
        filePath: f,
        outputPath: `${dir}/${name}_decrypted.pdf`,
        password,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message="Decrypting PDFs..." />
      <div>
        <h1 className="text-2xl font-bold">Decrypt PDF</h1>
        <p className="text-sm text-muted-foreground">
          Remove password protection from PDF files
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
              <button
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {files.length} file{files.length !== 1 ? "s" : ""} selected
      </p>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={async () => {
          const dir = await pickDirectory()
          if (dir) setOutputDir(dir)
        }}
        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
      >
        <FolderOpen className="h-4 w-4" />
        {outputDir ? outputDir.split("/").pop() : "Choose output folder"}
      </button>
      {outputDir && (
        <p className="truncate text-xs text-muted-foreground">{outputDir}</p>
      )}
      <button
        onClick={handleDecrypt}
        disabled={loading || files.length === 0 || !password}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Unlock className="h-4 w-4" />
        {loading ? "Decrypting..." : "Decrypt Files"}
      </button>
    </div>
  )
}
