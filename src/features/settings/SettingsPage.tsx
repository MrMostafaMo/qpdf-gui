import { useSettingsStore, useTheme } from "@/hooks"

export default function SettingsPage() {
  const {
    default_output_dir,
    overwrite_existing,
    remember_recent_files,
    max_recent_files,
    updateSettings,
  } = useSettingsStore()
  const { theme: activeTheme, setTheme } = useTheme()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure application preferences
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Appearance</h2>
        <div className="flex items-center gap-3 text-sm">
          <span>Theme</span>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t)
                  updateSettings({ theme: t })
                }}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                  activeTheme === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-medium">General</h2>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={overwrite_existing}
            onChange={(e) =>
              updateSettings({ overwrite_existing: e.target.checked })
            }
            className="h-4 w-4 rounded border-input"
          />
          Overwrite existing files
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
          Remember recent files
        </label>

        {remember_recent_files && (
          <div className="flex items-center gap-3 text-sm">
            <span>Max recent files:</span>
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
        <h2 className="text-sm font-medium">Default Output Directory</h2>
        <input
          type="text"
          value={default_output_dir}
          onChange={(e) =>
            updateSettings({ default_output_dir: e.target.value })
          }
          placeholder="Same as input file"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to save in the same directory as the input file
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-center">
        <p className="text-sm font-medium">Mostafa Mohamed</p>
        <p className="text-xs text-muted-foreground">Made with love in Egypt 🇪🇬</p>
      </div>
    </div>
  )
}
