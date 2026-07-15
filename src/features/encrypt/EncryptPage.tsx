import { useQpdf, useFileSelection } from "@/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Lock, X, FolderOpen } from "lucide-react"
import { useI18n } from "@/i18n"

export default function EncryptPage() {
  const { loading, runWithToast, startLoading } = useQpdf()
  const { files, setFiles, handleDrop, pickDirectory } = useFileSelection(true)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [outputDir, setOutputDir] = useState<string | null>(null)
  const [progressMsg, setProgressMsg] = useState("")
  const t = useI18n()

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

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const name = f.split("/").pop()?.replace(/\.pdf$/i, "") || "file"
      setProgressMsg(`${t.encrypt.loading} (${i + 1}/${files.length}) ${f.split("/").pop()}`)
      await runWithToast("encrypt_pdf", {
        filePath: f,
        outputPath: `${dir}/${name}_encrypted.pdf`,
        ownerPassword: password,
        userPassword: password,
        keyLength: 256,
      })
    }
    setProgressMsg("")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={progressMsg || t.encrypt.loading} />
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
        onClick={handleEncrypt}
        disabled={
          loading ||
          files.length === 0 ||
          !password ||
          password !== confirm
        }
      >
        <Lock />
        {loading ? t.encrypt.btnLoading : t.encrypt.btnIdle}
      </Button>
    </div>
  )
}
