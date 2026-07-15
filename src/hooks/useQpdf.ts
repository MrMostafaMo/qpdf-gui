import { useCallback, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { sendNotification } from "@tauri-apps/plugin-notification"
import type { OperationResult } from "@/types"
import { toast } from "sonner"
import { useLogStore } from "@/components/shared/OperationLogs"
import { useLoadingStore } from "@/stores"

export function useQpdf() {
  const [loading, setLoading] = useState(false)
  const setGlobalLoading = useLoadingStore((s) => s.setLoading)
  const addLog = useLogStore((s) => s.addEntry)
  const updateLog = useLogStore((s) => s.updateEntry)

  const setAllLoading = useCallback(
    (v: boolean) => {
      setLoading(v)
      setGlobalLoading(v)
    },
    [setGlobalLoading],
  )

  const run = useCallback(
    async <T>(command: string, args?: Record<string, unknown>): Promise<T> => {
      setAllLoading(true)
      try {
        const result = await invoke<T>(command, args)
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        toast.error(message)
        throw error
      } finally {
        setAllLoading(false)
      }
    },
    [setAllLoading],
  )

  const runWithToast = useCallback(
    async (
      command: string,
      args?: Record<string, unknown>,
    ): Promise<OperationResult> => {
      const inputFile = (args?.filePath as string) || ""
      const outputPath = (args?.outputPath as string) || ""
      const operationName = command.replace(/_/g, " ")

      const logId = addLog({
        operation: operationName,
        inputFile: inputFile.split("/").pop() || inputFile,
        outputFile: outputPath ? outputPath.split("/").pop() : undefined,
        status: "running",
      })

      setAllLoading(true)
      try {
        const result = await invoke<OperationResult>(command, args)
        if (result.success) {
          toast.success(result.message)
          updateLog(logId, { status: "success", message: result.message })
        } else {
          toast.error(result.message)
          updateLog(logId, { status: "error", message: result.message })
        }
        // Notify when window is not focused
        const focused = await getCurrentWindow().isFocused()
        if (!focused) {
          sendNotification({
            title: result.success ? "Operation Complete" : "Operation Failed",
            body: result.message,
          })
        }
        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        toast.error(message)
        updateLog(logId, { status: "error", message })
        const focused = await getCurrentWindow().isFocused()
        if (!focused) {
          sendNotification({ title: "Operation Failed", body: message })
        }
        throw error
      } finally {
        setAllLoading(false)
      }
    },
    [addLog, updateLog, setAllLoading],
  )

  return { loading, run, runWithToast, startLoading: () => setAllLoading(true) } as const
}
