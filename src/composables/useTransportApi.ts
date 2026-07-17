import { ref } from 'vue'
import type { Station, StationboardEntry, StationboardResponse, LocationsResponse } from '@/types/transport'
import type { FormattedDeparture } from '@/types/itinerary'
import { getCountdownLabel, minutesUntil } from '@/utils/format'
import { categoryToMode } from '@/utils/transportIcons'

const BASE_URL = 'https://transport.opendata.ch/v1'

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

  return {
    line,
    mode: categoryToMode(entry.category),
    to: entry.to,
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

  return { searchStations, getStationboard, loading, error }
}
