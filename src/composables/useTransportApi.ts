import { ref } from 'vue'
import type { Station, Connection, ConnectionsResponse, LocationsResponse } from '@/types/transport'
import type { FormattedConnection } from '@/types/itinerary'
import { parseDuration, getCountdownLabel, minutesUntil } from '@/utils/format'

const BASE_URL = 'https://transport.opendata.ch/v1'

function correctStationName(name: string): string {
  return name.replace(/\bzurich\b/gi, 'zürich')
}

function mapConnection(conn: Connection): FormattedConnection {
  const depTimestamp = conn.from.departureTimestamp
    ? conn.from.departureTimestamp * 1000
    : Date.now()
  const arrTimestamp = conn.to.arrivalTimestamp
    ? conn.to.arrivalTimestamp * 1000
    : Date.now()

  const journeySections = conn.sections.filter((s) => s.journey !== null)

  return {
    durationSeconds: parseDuration(conn.duration),
    transfers: Math.max(0, journeySections.length - 1),
    line:
      conn.products.length > 0
        ? conn.products.join(', ')
        : journeySections[0]?.journey
          ? `${journeySections[0].journey.category}${journeySections[0].journey.number}`
          : '',
    departure: {
      iso: conn.from.departure ?? '',
      timestampMs: depTimestamp,
      platform:
        conn.from.prognosis?.platform ?? conn.from.platform ?? null,
    },
    arrival: {
      iso: conn.to.arrival ?? '',
      timestampMs: arrTimestamp,
      platform: conn.to.prognosis?.platform ?? conn.to.platform ?? null,
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

  async function getConnections(
    fromId: string,
    toId: string
  ): Promise<FormattedConnection[]> {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        from: fromId,
        to: toId,
        limit: '6',
      })
      const res = await fetch(`${BASE_URL}/connections?${params}`)
      if (!res.ok) {
        error.value = 'errors.apiUnavailable'
        return []
      }
      const data: ConnectionsResponse = await res.json()

      const now = Date.now()
      return data.connections
        .map(mapConnection)
        .filter((c) => c.departure.timestampMs > now - 60_000)
        .sort((a, b) => a.departure.timestampMs - b.departure.timestampMs)
    } catch {
      error.value = 'errors.apiUnavailable'
      return []
    } finally {
      loading.value = false
    }
  }

  return { searchStations, getConnections, loading, error }
}
