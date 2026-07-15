import { create } from "zustand"
import type { PdfInfo } from "@/types"

interface FileState {
  recentFiles: PdfInfo[]
  pendingFile: string | null
  addRecentFile: (file: PdfInfo, max?: number) => void
  clearRecentFiles: () => void
  setPendingFile: (path: string | null) => void
}

export const useFileStore = create<FileState>((set) => ({
  recentFiles: [],
  pendingFile: null,
  addRecentFile: (file, max = 20) =>
    set((s) => {
      const filtered = s.recentFiles.filter(
        (f) => f.file_path !== file.file_path,
      )
      return { recentFiles: [file, ...filtered].slice(0, max) }
    }),
  clearRecentFiles: () => set({ recentFiles: [] }),
  setPendingFile: (path) => set({ pendingFile: path }),
}))
