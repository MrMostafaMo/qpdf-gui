import { useFileSelection } from "@/hooks"
import { useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { sendNotification } from "@tauri-apps/plugin-notification"
import { toast } from "sonner"
import { ProgressOverlay, DropZone } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Unlock, X, FolderOpen } from "lucide-react"
import { useI18n } from "@/i18n"
import { useLogStore } from "@/components/shared/OperationLogs"
import { useLoadingStore } from "@/stores"
import type { OperationResult } from "@/types"

export default function DecryptPage() {
  const loading = useLoadingStore((s) => s.loading)
  const setLoading = useLoadingStore((s) => s.setLoading)
  const { files, setFiles, handleDrop, pickDirectory } = useFileSelection(true)
  const [password, setPassword] = useState("")
  const [outputDir, setOutputDir] = useState<string | null>(null)
  const [progressMsg, setProgressMsg] = useState("")
  const addLog = useLogStore((s) => s.addEntry)
  const updateLog = useLogStore((s) => s.updateEntry)
  const t = useI18n()

  const handleDecrypt = async () => {
    if (files.length === 0) return toast.error(t.decrypt.errorNoFiles)
    if (!password) return toast.error(t.decrypt.errorNoPassword)

    let dir = outputDir
    if (!dir) {
      dir = await pickDirectory()
      if (!dir) return
      setOutputDir(dir)
    }
    setLoading(true)

    let successCount = 0
    let errorCount = 0
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const name = f.split("/").pop()?.replace(/\.pdf$/i, "") || "file"
      const outputPath = `${dir}/${name}_decrypted.pdf`
      setProgressMsg(`${t.decrypt.loading} (${i + 1}/${files.length}) ${f.split("/").pop()}`)
      const logId = addLog({
        operation: "decrypt_pdf",
        inputFile: f.split("/").pop() || f,
        outputFile: `${name}_decrypted.pdf`,
        status: "running",
      })
      try {
        const result = await invoke<OperationResult>("decrypt_pdf", {
          filePath: f,
          outputPath,
          password,
        })
        if (result.success) {
          successCount++
          updateLog(logId, { status: "success", message: result.message })
        } else {
          errorCount++
          updateLog(logId, { status: "error", message: result.message })
        }
      } catch (error) {
        errorCount++
        const message = error instanceof Error ? error.message : String(error)
        updateLog(logId, { status: "error", message })
      }
    }
    setProgressMsg("")
    setLoading(false)

    const summary = errorCount === 0
      ? `${successCount} files decrypted`
      : `${successCount} OK, ${errorCount} errors`
    toast[errorCount === 0 ? "success" : "error"](summary)
    const focused = await getCurrentWindow().isFocused()
    if (!focused) {
      sendNotification({ title: "Decrypt", body: summary })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={progressMsg || t.decrypt.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.decrypt.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.decrypt.subtitle}
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
        placeholder={t.decrypt.enterPassword}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label={t.decrypt.enterPassword}
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
        onClick={handleDecrypt}
        disabled={loading || files.length === 0 || !password}
      >
        <Unlock />
        {loading ? t.decrypt.btnLoading : t.decrypt.btnIdle}
      </Button>
    </div>
  )
}
