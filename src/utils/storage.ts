import type { SavedStationEntry } from '@/types/itinerary'
import type { AppSettings } from '@/types/itinerary'
import { getBrowserLocale } from '@/utils/locale'

const STATIONS_KEY = 'nexteli:stations'
const SETTINGS_KEY = 'nexteli:settings'

const DEFAULT_SETTINGS: AppSettings = {
  locale: getBrowserLocale(),
  theme: 'nexteli',
}

export function loadStations(): SavedStationEntry[] {
  try {
    const raw = localStorage.getItem(STATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r: unknown) =>
        typeof r === 'object' &&
        r !== null &&
        'id' in r &&
        'station' in r &&
        'direction' in r
    ) as SavedStationEntry[]
  } catch {
    return []
  }
}

export function saveStations(stations: SavedStationEntry[]): void {
  localStorage.setItem(STATIONS_KEY, JSON.stringify(stations))
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
  localStorage.removeItem(STATIONS_KEY)
  localStorage.removeItem(SETTINGS_KEY)
}
