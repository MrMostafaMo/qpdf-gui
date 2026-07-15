import { DropZone } from "@/components/shared"
import { useFilePicker, useQpdf } from "@/hooks"
import { useFileStore } from "@/stores"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgressOverlay } from "@/components/shared"
import { Lock, X, FolderOpen } from "lucide-react"
import { useI18n } from "@/i18n"

export default function EncryptPage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { pickDirectory } = useFilePicker()
  const [files, setFiles] = useState<string[]>([])
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [outputDir, setOutputDir] = useState<string | null>(null)
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  useEffect(() => {
    if (pendingFile) { setFiles((p) => [...p, pendingFile]); setPendingFile(null) }
  }, [])

  const handleDrop = (paths: string[]) =>
    setFiles((prev) => [...prev, ...paths])

  const handleEncrypt = async () => {
    if (files.length === 0) return toast.error(t.encrypt.errorNoFiles)
    if (!password) return toast.error(t.encrypt.errorNoPassword)
    if (password !== confirm) return toast.error(t.encrypt.errorMismatch)

    let dir = outputDir
    if (!dir) {
      dir = await pickDirectory()
      if (!dir) return
      setOutputDir(dir)
    }
    startLoading()

    for (const f of files) {
      const name = f.split("/").pop()?.replace(/\.pdf$/i, "") || "file"
      await runWithToast("encrypt_pdf", {
        filePath: f,
        outputPath: `${dir}/${name}_encrypted.pdf`,
        ownerPassword: password,
        userPassword: password,
        keyLength: 256,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.encrypt.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.encrypt.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.encrypt.subtitle}
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
        {files.length} {files.length !== 1 ? t.shared.filesSelected : t.shared.fileSelected}
      </p>
      <input
        type="password"
        placeholder={t.encrypt.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <input
        type="password"
        placeholder={t.encrypt.confirmPassword}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
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
        {outputDir ? outputDir.split("/").pop() : t.shared.chooseOutputFolder}
      </button>
      {outputDir && (
        <p className="truncate text-xs text-muted-foreground">{outputDir}</p>
      )}
      <button
        onClick={handleEncrypt}
        disabled={
          loading ||
          files.length === 0 ||
          !password ||
          password !== confirm
        }
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        {loading ? t.encrypt.btnLoading : t.encrypt.btnIdle}
      </button>
    </div>
  )
}
