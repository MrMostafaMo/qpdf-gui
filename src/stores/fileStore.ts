import { create } from "zustand"
import type { PdfInfo } from "@/types"

interface FileState {
  currentFile: PdfInfo | null
  recentFiles: PdfInfo[]
  setCurrentFile: (file: PdfInfo | null) => void
  addRecentFile: (file: PdfInfo, max?: number) => void
  clearRecentFiles: () => void
}

export const useFileStore = create<FileState>((set) => ({
  currentFile: null,
  recentFiles: [],
  setCurrentFile: (file) => set({ currentFile: file }),
  addRecentFile: (file, max = 20) =>
    set((s) => {
      const filtered = s.recentFiles.filter(
        (f) => f.file_path !== file.file_path,
      )
      return { recentFiles: [file, ...filtered].slice(0, max) }
    }),
  clearRecentFiles: () => set({ recentFiles: [] }),
}))
