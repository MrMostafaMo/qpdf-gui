import en from "./locales/en"
import ar from "./locales/ar"
import { useSettingsStore } from "@/stores/settingsStore"

const locales = { en, ar } as const

export type Locale = keyof typeof locales

export function getTranslations(locale: Locale) {
  return locales[locale] ?? locales.en
}

export function useI18n() {
  const locale = useSettingsStore((s) => s.language)
  return getTranslations(locale)
}
