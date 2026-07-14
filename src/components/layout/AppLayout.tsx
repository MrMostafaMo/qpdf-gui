import { Outlet, useNavigate } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { useAppStore } from "@/stores"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { ProgressBar } from "@/components/shared"

const SHORTCUTS: [string, string][] = [
  ["ctrl+o", "/info"],
  ["ctrl+shift+e", "/extract"],
  ["ctrl+shift+m", "/merge"],
  ["ctrl+shift+s", "/split"],
  ["ctrl+shift+r", "/rotate"],
  ["ctrl+shift+d", "/delete"],
  ["ctrl+shift+l", "/linearize"],
  ["ctrl+shift+z", "/optimize"],
  ["ctrl+,", "/settings"],
]

export function AppLayout() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && "ctrl",
        e.shiftKey && "shift",
        e.altKey && "alt",
        e.metaKey && "meta",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+")

      for (const [shortcut, path] of SHORTCUTS) {
        if (key === shortcut) {
          e.preventDefault()
          navigate(path)
          return
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [navigate])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ProgressBar />
      <Sidebar />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
