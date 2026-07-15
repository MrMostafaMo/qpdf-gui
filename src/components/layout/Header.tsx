import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "@/hooks"
import { useLocation } from "react-router-dom"
import { useI18n } from "@/i18n"
import type { Theme } from "@/types/settings"

const THEMES: { value: Theme; icon: typeof Sun; key: "light" | "dark" | "system" }[] = [
  { value: "light", icon: Sun, key: "light" },
  { value: "dark", icon: Moon, key: "dark" },
  { value: "system", icon: Monitor, key: "system" },
]

const PAGE_KEYS: Record<string, keyof ReturnType<typeof useI18n>["page"]> = {
  "/": "dashboard",
  "/extract": "extractPages",
  "/merge": "mergePdfs",
  "/split": "splitPdf",
  "/rotate": "rotatePages",
  "/delete": "deletePages",
  "/encrypt": "encryptPdf",
  "/decrypt": "decryptPdf",
  "/optimize": "optimizePdf",
  "/linearize": "linearizePdf",
  "/info": "pdfInfo",
  "/batch": "batchOps",
  "/settings": "settings",
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const t = useI18n()
  const pageKey = PAGE_KEYS[pathname]
  const pageName = pageKey ? t.page[pageKey] : t.page.dashboard

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <h1 className="text-sm font-medium text-muted-foreground">{pageName}</h1>
      <div className="flex items-center gap-1">
        {THEMES.map(({ value, icon: Icon, key }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={t.theme[key]}
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
