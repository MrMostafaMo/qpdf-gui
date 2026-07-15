import { describe, it, expect, beforeEach } from "vitest"
import { useAppStore } from "../appStore"

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.setState({ sidebarCollapsed: false, theme: "system" })
  })

  it("toggles sidebar", () => {
    expect(useAppStore.getState().sidebarCollapsed).toBe(false)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarCollapsed).toBe(true)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarCollapsed).toBe(false)
  })

  it("sets sidebar collapsed", () => {
    useAppStore.getState().setSidebarCollapsed(true)
    expect(useAppStore.getState().sidebarCollapsed).toBe(true)
  })

  it("sets theme", () => {
    useAppStore.getState().setTheme("dark")
    expect(useAppStore.getState().theme).toBe("dark")
  })

  it("defaults to system theme", () => {
    expect(useAppStore.getState().theme).toBe("system")
  })
})
