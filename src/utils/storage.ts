import type { SavedRoute } from '@/types/itinerary'
import type { AppSettings } from '@/types/itinerary'

const ROUTES_KEY = 'nexteli:routes'
const SETTINGS_KEY = 'nexteli:settings'

const DEFAULT_SETTINGS: AppSettings = {
  locale: 'de',
  theme: 'nexteli',
}

export function loadRoutes(): SavedRoute[] {
  try {
    const raw = localStorage.getItem(ROUTES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r: unknown) =>
        typeof r === 'object' &&
        r !== null &&
        'id' in r &&
        'departure' in r &&
        'destination' in r
    ) as SavedRoute[]
  } catch {
    return []
  }
}

export function saveRoutes(routes: SavedRoute[]): void {
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes))
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return {
      locale: parsed.locale ?? DEFAULT_SETTINGS.locale,
      theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function clearAllData(): void {
  localStorage.removeItem(ROUTES_KEY)
  localStorage.removeItem(SETTINGS_KEY)
}
