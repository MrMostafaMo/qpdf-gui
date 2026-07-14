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
import { useAppStore } from "@/stores"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/extract", icon: FileOutput, label: "Extract" },
  { to: "/merge", icon: Merge, label: "Merge" },
  { to: "/split", icon: Scissors, label: "Split" },
  { to: "/rotate", icon: RotateCw, label: "Rotate" },
  { to: "/delete", icon: Trash2, label: "Delete" },
  { to: "/encrypt", icon: Lock, label: "Encrypt" },
  { to: "/decrypt", icon: Unlock, label: "Decrypt" },
  { to: "/optimize", icon: Maximize2, label: "Optimize" },
  { to: "/linearize", icon: Zap, label: "Linearize" },
  { to: "/info", icon: Info, label: "Info" },
  { to: "/batch", icon: Layers, label: "Batch" },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold tracking-tight">QPDF GUI</span>
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
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={label}
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
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border py-2">
        <NavLink
          to="/settings"
          title="Settings"
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
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  )
}
