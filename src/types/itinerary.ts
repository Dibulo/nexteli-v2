export interface SavedStation {
  id: string
  name: string
  icon?: string
}

export interface SavedStationEntry {
  id: string
  createdAt: number
  station: SavedStation
  /** Final destination / direction filter, or null = all directions */
  direction: string | null
}

export type TransportMode = 'train' | 'tram' | 'bus'

export interface FormattedDeparture {
  line: string
  mode: TransportMode
  to: string
  departure: {
    iso: string
    timestampMs: number
    platform: string | null
  }
  minutesUntilDeparture: number
  countdownLabel: string
}

export interface StationEntryWithDepartures extends SavedStationEntry {
  departures: FormattedDeparture[]
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
}

export type ThemeId = 'nexteli' | 'nexteli-dark'
export type LocaleId = 'de' | 'en' | 'es' | 'fr' | 'it' | 'gsw'

export interface AppSettings {
  locale: LocaleId
  theme: ThemeId
}
