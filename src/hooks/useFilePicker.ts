import { useCallback } from "react"
import { open, save } from "@tauri-apps/plugin-dialog"

const PDF_FILTER = { name: "PDF", extensions: ["pdf"] }

export function useFilePicker() {
  const pickFiles = useCallback(async (options?: { multiple?: boolean }) => {
    const selected = await open({
      multiple: options?.multiple ?? false,
      filters: [PDF_FILTER],
    })

    if (selected === null) return null
    if (typeof selected === "string") return [selected]
    return selected
  }, [])

  const pickDirectory = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    })

    if (selected === null) return null
    if (typeof selected === "string") return selected
    return selected[0] ?? null
  }, [])

  const saveFile = useCallback(
    async (defaultName?: string) => {
      const path = await save({
        filters: [PDF_FILTER],
        defaultPath: defaultName,
      })
      return path
    },
    [],
  )

  return { pickFiles, pickDirectory, saveFile }
}
