import { create } from "zustand"

type Theme = "light" | "dark" | "system"

interface AppState {
  sidebarCollapsed: boolean
  theme: Theme
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: Theme) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: "system",
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
}))
