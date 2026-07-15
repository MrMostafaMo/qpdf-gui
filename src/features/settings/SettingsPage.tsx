import { useSettingsStore, useTheme } from "@/hooks"
import { useI18n, type Locale } from "@/i18n"

const LANGUAGES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
]

export default function SettingsPage() {
  const {
    default_output_dir,
    overwrite_existing,
    remember_recent_files,
    max_recent_files,
    language,
    updateSettings,
  } = useSettingsStore()
  const { theme: activeTheme, setTheme } = useTheme()
  const t = useI18n()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.settings.subtitle}
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium">{t.settings.appearance}</h2>
        <div className="flex items-center gap-3 text-sm">
          <span>{t.settings.theme}</span>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((th) => (
              <button
                key={th}
                onClick={() => {
                  setTheme(th)
                  updateSettings({ theme: th })
                }}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                  activeTheme === th
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t.theme[th]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium">{t.settings.language}</h2>
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => updateSettings({ language: lang.value })}
              className={`rounded-md px-3 py-1.5 text-sm ${
                language === lang.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium">{t.settings.general}</h2>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={overwrite_existing}
            onChange={(e) =>
              updateSettings({ overwrite_existing: e.target.checked })
            }
            className="h-4 w-4 rounded border-input"
          />
          {t.settings.overwrite}
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={remember_recent_files}
            onChange={(e) =>
              updateSettings({ remember_recent_files: e.target.checked })
            }
            className="h-4 w-4 rounded border-input"
          />
          {t.settings.rememberRecent}
        </label>

        {remember_recent_files && (
          <div className="flex items-center gap-3 text-sm">
            <span>{t.settings.maxRecent}</span>
            <input
              type="number"
              value={max_recent_files}
              onChange={(e) =>
                updateSettings({ max_recent_files: Number(e.target.value) })
              }
              min={5}
              max={50}
              className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium">{t.settings.defaultOutput}</h2>
        <input
          type="text"
          value={default_output_dir}
          onChange={(e) =>
            updateSettings({ default_output_dir: e.target.value })
          }
          placeholder={t.settings.defaultOutputPlaceholder}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {t.settings.defaultOutputHint}
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-center">
        <p className="text-sm font-medium">{t.settings.developer.name}</p>
        <p className="text-xs text-muted-foreground">{t.settings.developer.credit}</p>
      </div>
    </div>
  )
}
