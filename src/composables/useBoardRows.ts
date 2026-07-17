import { computed } from 'vue'
import { useStations } from '@/composables/useStations'
import type {
  FormattedDeparture,
  StationEntryWithDepartures,
} from '@/types/itinerary'

export const BOARD_DISPLAY_LIMIT = 5

export interface BoardRow {
  entry: StationEntryWithDepartures
  departure: FormattedDeparture | null
}

/**
 * Next departure per saved station, sorted by soonest departure, capped at 5.
 * Entries without a departure are kept (with null) so the board stays stable.
 */
export function useBoardRows() {
  const { stationEntries, refreshStation, refreshAll } = useStations()

  const boardRows = computed<BoardRow[]>(() => {
    const rows: BoardRow[] = stationEntries.value.map((entry) => ({
      entry,
      departure: entry.departures[0] ?? null,
    }))

    rows.sort((a, b) => {
      const aTs = a.departure?.departure.timestampMs ?? Number.POSITIVE_INFINITY
      const bTs = b.departure?.departure.timestampMs ?? Number.POSITIVE_INFINITY
      if (aTs !== bTs) return aTs - bTs
      return a.entry.createdAt - b.entry.createdAt
    })

    return rows.slice(0, BOARD_DISPLAY_LIMIT)
  })

  return {
    boardRows,
    refreshStation,
    refreshAll,
  }
}
