import { ref } from 'vue'
import type { Station, StationboardEntry, StationboardResponse, LocationsResponse } from '@/types/transport'
import type { FormattedDeparture, JourneyDeparture, JourneyStop } from '@/types/itinerary'
import { getCountdownLabel, minutesUntil } from '@/utils/format'
import { categoryToMode } from '@/utils/transportIcons'
import { lookupLineColor } from '@/utils/lineColors'

const BASE_URL = 'https://transport.opendata.ch/v1'

const JOURNEY_FIELDS = [
  'stationboard/stop',
  'stationboard/name',
  'stationboard/category',
  'stationboard/number',
  'stationboard/operator',
  'stationboard/to',
  'stationboard/passList',
] as const

function correctStationName(name: string): string {
  return name.replace(/\bzurich\b/gi, 'zürich')
}

function mapStationboardEntry(entry: StationboardEntry): FormattedDeparture {
  const depTimestamp = entry.stop.departureTimestamp
    ? entry.stop.departureTimestamp * 1000
    : Date.now()

  const line =
    entry.category && entry.number
      ? `${entry.category}${entry.number}`
      : entry.name || entry.category || ''

  const color = lookupLineColor(entry.operator, entry.category, entry.number)

  return {
    line,
    mode: categoryToMode(entry.category),
    to: entry.to,
    ...(color ? { color } : {}),
    departure: {
      iso: entry.stop.departure ?? '',
      timestampMs: depTimestamp,
      platform:
        entry.stop.prognosis?.platform ?? entry.stop.platform ?? null,
    },
    minutesUntilDeparture: minutesUntil(depTimestamp),
    countdownLabel: getCountdownLabel(depTimestamp),
  }
}

function mapJourneyStops(entry: StationboardEntry): JourneyStop[] {
  const currentStation = entry.stop.station
  const depTimestamp = entry.stop.departureTimestamp
    ? entry.stop.departureTimestamp * 1000
    : null

  const stops: JourneyStop[] = [
    {
      stationId: currentStation.id,
      name: currentStation.name,
      arrivalTimestampMs: depTimestamp,
      minutesUntil: depTimestamp != null ? minutesUntil(depTimestamp) : null,
      isCurrent: true,
    },
  ]

  const seen = new Set<string>([currentStation.id])

  for (const checkpoint of entry.passList ?? []) {
    const name = checkpoint.station?.name
    const id = checkpoint.station?.id
    if (!name || !id || seen.has(id)) continue
    seen.add(id)

    const arrivalMs = checkpoint.arrivalTimestamp
      ? checkpoint.arrivalTimestamp * 1000
      : checkpoint.departureTimestamp
        ? checkpoint.departureTimestamp * 1000
        : null

    stops.push({
      stationId: id,
      name,
      arrivalTimestampMs: arrivalMs,
      minutesUntil: arrivalMs != null ? minutesUntil(arrivalMs) : null,
      isCurrent: false,
    })
  }

  return stops
}

function mapJourneyDeparture(entry: StationboardEntry): JourneyDeparture {
  return {
    ...mapStationboardEntry(entry),
    stationId: entry.stop.station.id,
    stops: mapJourneyStops(entry),
  }
}

export function useTransportApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function searchStations(query: string): Promise<Station[]> {
    if (!query.trim()) return []

    loading.value = true
    error.value = null

    try {
      const corrected = correctStationName(query.trim())
      const params = new URLSearchParams({
        query: corrected,
        type: 'station',
      })
      const res = await fetch(`${BASE_URL}/locations?${params}`)
      if (!res.ok) {
        error.value = 'errors.apiUnavailable'
        return []
      }
      const data: LocationsResponse = await res.json()
      return data.stations.filter((s) => s.id)
    } catch {
      error.value = 'errors.apiUnavailable'
      return []
    } finally {
      loading.value = false
    }
  }

  async function getStationboard(
    stationId: string,
    limit = 30
  ): Promise<FormattedDeparture[]> {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        id: stationId,
        limit: String(limit),
      })
      const res = await fetch(`${BASE_URL}/stationboard?${params}`)
      if (!res.ok) {
        error.value = 'errors.apiUnavailable'
        return []
      }
      const data: StationboardResponse = await res.json()

      const now = Date.now()
      return data.stationboard
        .map(mapStationboardEntry)
        .filter((d) => d.departure.timestampMs > now - 60_000)
        .sort((a, b) => a.departure.timestampMs - b.departure.timestampMs)
    } catch {
      error.value = 'errors.apiUnavailable'
      return []
    } finally {
      loading.value = false
    }
  }

  async function getStationboardWithJourney(
    stationId: string,
    limit = 15
  ): Promise<JourneyDeparture[]> {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        id: stationId,
        limit: String(limit),
      })
      for (const field of JOURNEY_FIELDS) {
        params.append('fields[]', field)
      }

      const res = await fetch(`${BASE_URL}/stationboard?${params}`)
      if (!res.ok) {
        error.value = 'errors.apiUnavailable'
        return []
      }
      const data: StationboardResponse = await res.json()

      const now = Date.now()
      return data.stationboard
        .map(mapJourneyDeparture)
        .filter((d) => d.departure.timestampMs > now - 60_000)
        .sort((a, b) => a.departure.timestampMs - b.departure.timestampMs)
    } catch {
      error.value = 'errors.apiUnavailable'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    searchStations,
    getStationboard,
    getStationboardWithJourney,
    loading,
    error,
  }
}
