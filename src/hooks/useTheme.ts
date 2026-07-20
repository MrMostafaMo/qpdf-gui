import { useCallback, useEffect } from "react"
import { useAppStore } from "@/stores"
import { useSettingsStore } from "@/stores/settingsStore"
import type { Theme } from "@/types/settings"

export function useTheme() {
  const { theme, setTheme: setAppTheme } = useAppStore()
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const setTheme = useCallback(
    (t: Theme) => {
      setAppTheme(t)
      updateSettings({ theme: t })
    },
    [setAppTheme, updateSettings],
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const apply = (dark: boolean) => {
        root.classList.remove("light", "dark")
        root.classList.add(dark ? "dark" : "light")
      }
      apply(mq.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return { theme, setTheme }
}
