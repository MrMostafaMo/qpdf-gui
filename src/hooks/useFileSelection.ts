import { useState, useEffect, useCallback } from "react"
import { useFilePicker } from "./useFilePicker"
import { useFileStore } from "@/stores"

export function useFileSelection(multiple = false) {
  const { saveFile, pickDirectory } = useFilePicker()
  const [file, setFile] = useState<string | null>(null)
  const [files, setFiles] = useState<string[]>([])
  const pendingFile = useFileStore((s) => s.pendingFile)
  const setPendingFile = useFileStore((s) => s.setPendingFile)

  useEffect(() => {
    if (pendingFile) {
      if (multiple) setFiles((p) => [...p, pendingFile])
      else setFile(pendingFile)
      setPendingFile(null)
    }
  }, [])

  const handleDrop = useCallback(
    (paths: string[]) => {
      if (multiple) setFiles((prev) => [...prev, ...paths])
      else setFile(paths[0])
    },
    [multiple],
  )

  return { file, setFile, files, setFiles, handleDrop, saveFile, pickDirectory }
}
