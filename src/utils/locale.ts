import type { LocaleId } from '@/types/itinerary'

const SUPPORTED_LOCALES = new Set<LocaleId>(['de', 'en', 'es', 'fr', 'it', 'gsw'])

function resolveLocaleTag(tag: string): LocaleId | null {
  const normalized = tag.toLowerCase()

  if (SUPPORTED_LOCALES.has(normalized as LocaleId)) {
    return normalized as LocaleId
  }

  const prefix = normalized.split('-')[0] as LocaleId
  if (SUPPORTED_LOCALES.has(prefix)) {
    return prefix
  }

  return null
}

export function getBrowserLocale(): LocaleId {
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]

  for (const language of languages) {
    const resolved = resolveLocaleTag(language)
    if (resolved) return resolved
  }

  return 'en'
}
