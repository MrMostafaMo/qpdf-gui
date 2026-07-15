import { create } from "zustand"
import type { Settings } from "@/types"
import { DEFAULT_SETTINGS } from "@/types"
import { Store } from "@tauri-apps/plugin-store"

const STORE_KEY = "settings"
let storeInstance: Store | null = null

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load("settings.json")
  }
  return storeInstance
}

interface SettingsState extends Settings {
  updateSettings: (partial: Partial<Settings>) => Promise<void>
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,

  loadSettings: async () => {
    try {
      const store = await getStore()
      const saved = await store.get<Settings>(STORE_KEY)
      if (saved) set(saved)
    } catch {
      // No saved settings, use defaults
    }
  },

  updateSettings: async (partial) => {
    set(partial)
    try {
      const store = await getStore()
      const current = useSettingsStore.getState()
      await store.set(STORE_KEY, {
        default_output_dir: current.default_output_dir,
        overwrite_existing: current.overwrite_existing,
        theme: current.theme,
        remember_recent_files: current.remember_recent_files,
        max_recent_files: current.max_recent_files,
        language: current.language,
      })
      await store.save()
    } catch {
      // Best effort persistence
    }
  },
}))
