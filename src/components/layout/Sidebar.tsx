import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FileOutput,
  Merge,
  Scissors,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Maximize2,
  Zap,
  Info,
  Layers,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { useAppStore, useSettingsStore } from "@/stores"
import { useI18n } from "@/i18n"
import { cn } from "@/lib/utils"

const NAV_KEYS = [
  { to: "/", icon: LayoutDashboard, key: "dashboard" as const },
  { to: "/extract", icon: FileOutput, key: "extract" as const },
  { to: "/merge", icon: Merge, key: "merge" as const },
  { to: "/split", icon: Scissors, key: "split" as const },
  { to: "/rotate", icon: RotateCw, key: "rotate" as const },
  { to: "/delete", icon: Trash2, key: "delete" as const },
  { to: "/encrypt", icon: Lock, key: "encrypt" as const },
  { to: "/decrypt", icon: Unlock, key: "decrypt" as const },
  { to: "/optimize", icon: Maximize2, key: "optimize" as const },
  { to: "/linearize", icon: Zap, key: "linearize" as const },
  { to: "/info", icon: Info, key: "info" as const },
  { to: "/batch", icon: Layers, key: "batch" as const },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const t = useI18n()
  const language = useSettingsStore((s) => s.language)
  const isRtl = language === "ar"

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-30 flex flex-col border-border bg-card transition-all duration-300",
        isRtl ? "right-0 border-l" : "left-0 border-r",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold tracking-tight">{t.appName}</span>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_KEYS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={t.nav[key]}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md mx-2 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                sidebarCollapsed && "justify-center px-0 mx-2",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>{t.nav[key]}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border py-2">
        <NavLink
          to="/settings"
          title={t.nav.settings}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md mx-2 px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              sidebarCollapsed && "justify-center px-0 mx-2",
            )
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>{t.nav.settings}</span>}
        </NavLink>
      </div>
    </aside>
  )
}
