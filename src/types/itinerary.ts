export interface SavedStation {
  id: string
  name: string
  icon?: string
}

export interface SavedRoute {
  id: string
  createdAt: number
  departure: SavedStation
  destination: SavedStation
}

export interface FormattedConnection {
  durationSeconds: number
  transfers: number
  line: string
  departure: {
    iso: string
    timestampMs: number
    platform: string | null
  }
  arrival: {
    iso: string
    timestampMs: number
    platform: string | null
  }
  minutesUntilDeparture: number
  countdownLabel: string
}

export interface RouteWithConnections extends SavedRoute {
  connections: FormattedConnection[]
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
}

export type ThemeId = 'nexteli' | 'nexteli-dark'
export type LocaleId = 'de' | 'fr' | 'it' | 'gsw'

export interface AppSettings {
  locale: LocaleId
  theme: ThemeId
}
