import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "@/hooks"
import { useLocation } from "react-router-dom"
import type { Theme } from "@/types/settings"

const THEMES: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
]

const PAGE_NAMES: Record<string, string> = {
  "/": "Dashboard",
  "/extract": "Extract Pages",
  "/merge": "Merge PDFs",
  "/split": "Split PDF",
  "/rotate": "Rotate Pages",
  "/delete": "Delete Pages",
  "/encrypt": "Encrypt PDF",
  "/decrypt": "Decrypt PDF",
  "/optimize": "Optimize PDF",
  "/linearize": "Linearize PDF",
  "/info": "PDF Info",
  "/batch": "Batch Operations",
  "/settings": "Settings",
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const pageName = PAGE_NAMES[pathname] ?? "Dashboard"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <h1 className="text-sm font-medium text-muted-foreground">{pageName}</h1>
      <div className="flex items-center gap-1">
        {THEMES.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              theme === value
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </header>
  )
}
