export type Theme = "light" | "dark" | "system"

export interface Settings {
  default_output_dir: string
  overwrite_existing: boolean
  theme: Theme
  remember_recent_files: boolean
  max_recent_files: number
}

export const DEFAULT_SETTINGS: Settings = {
  default_output_dir: "",
  overwrite_existing: false,
  theme: "system",
  remember_recent_files: true,
  max_recent_files: 20,
}
