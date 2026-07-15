import { create } from "zustand"
import type { PdfInfo } from "@/types"

interface FileState {
  currentFile: PdfInfo | null
  recentFiles: PdfInfo[]
  pendingFile: string | null
  setCurrentFile: (file: PdfInfo | null) => void
  addRecentFile: (file: PdfInfo, max?: number) => void
  clearRecentFiles: () => void
  setPendingFile: (path: string | null) => void
}

export const useFileStore = create<FileState>((set) => ({
  currentFile: null,
  recentFiles: [],
  pendingFile: null,
  setCurrentFile: (file) => set({ currentFile: file }),
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
