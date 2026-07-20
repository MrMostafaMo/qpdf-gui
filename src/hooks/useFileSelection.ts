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
      if (multiple) setFiles((p) => p.includes(pendingFile) ? p : [...p, pendingFile])
      else setFile(pendingFile)
      setPendingFile(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDrop = useCallback(
    (paths: string[]) => {
      if (multiple) setFiles((prev) => {
        const newPaths = paths.filter((p) => !prev.includes(p))
        return [...prev, ...newPaths]
      })
      else setFile(paths[0])
    },
    [multiple],
  )

  return { file, setFile, files, setFiles, handleDrop, saveFile, pickDirectory }
}
