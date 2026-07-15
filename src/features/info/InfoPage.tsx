import { useState, useEffect } from "react"
import { useQpdf, useSettingsStore } from "@/hooks"
import { useFileStore } from "@/stores"
import { ProgressOverlay } from "@/components/shared"
import { FileText } from "lucide-react"
import { DropZone } from "@/components/shared"
import { toast } from "sonner"
import { useI18n } from "@/i18n"

interface PdfInfoData {
  page_count: number
  file_name?: string
  file_size?: number
  title?: string
  author?: string
  creator?: string
  producer?: string
  creation_date?: string
  is_encrypted?: boolean
}

export default function InfoPage() {
  const { loading, run } = useQpdf()
  const addRecentFile = useFileStore((s) => s.addRecentFile)
  const maxRecentFiles = useSettingsStore((s) => s.max_recent_files)
  const [file, setFile] = useState<string | null>(null)
  const [info, setInfo] = useState<PdfInfoData | null>(null)
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)
  const t = useI18n()

  useEffect(() => {
    if (pendingFile) { handleDrop([pendingFile]); setPendingFile(null) }
  }, [])

  const handleDrop = async (paths: string[]) => {
    const f = paths[0]
    setFile(f)
    setInfo(null)
    try {
      const result = await run<PdfInfoData>("get_pdf_info", { filePath: f })
      setInfo(result)
      addRecentFile({
        file_path: f,
        file_name: result.file_name ?? f.split("/").pop() ?? f,
        file_size: result.file_size ?? 0,
        page_count: result.page_count,
        is_encrypted: result.is_encrypted ?? false,
        title: result.title ?? null,
        author: result.author ?? null,
        creation_date: result.creation_date ?? null,
        creator: result.creator ?? null,
        producer: result.producer ?? null,
      }, maxRecentFiles)
      toast.success(t.info.loaded)
    } catch {
      // run already shows error toast
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressOverlay loading={loading} message={t.info.loading} />
      <div>
        <h1 className="text-2xl font-bold">{t.info.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.info.subtitle}
        </p>
      </div>
      <DropZone onFilesSelected={handleDrop} />
      {file && (
        <p className="truncate text-sm text-muted-foreground">{file}</p>
      )}
      {info && (
        <div className="space-y-2 rounded-md border border-border p-4">
          <InfoRow label={t.info.pages} value={String(info.page_count)} />
          {info.file_name && <InfoRow label={t.info.file} value={info.file_name} />}
          {info.file_size != null && (
            <InfoRow label={t.info.size} value={`${(info.file_size / 1024).toFixed(1)} KB`} />
          )}
          {info.title && <InfoRow label={t.info.title_} value={info.title} />}
          {info.author && <InfoRow label={t.info.author} value={info.author} />}
          {info.creator && <InfoRow label={t.info.creator} value={info.creator} />}
          {info.producer && <InfoRow label={t.info.producer} value={info.producer} />}
          {info.creation_date && <InfoRow label={t.info.created} value={info.creation_date} />}
          <InfoRow
            label={t.info.encrypted}
            value={info.is_encrypted ? t.info.yes : t.info.no}
          />
        </div>
      )}
      {!info && !loading && (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t.info.empty}
          </p>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
