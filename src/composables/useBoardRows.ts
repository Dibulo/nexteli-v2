import { computed } from 'vue'
import { useStations } from '@/composables/useStations'
import type {
  FormattedDeparture,
  StationEntryWithDepartures,
} from '@/types/itinerary'

export const BOARD_DISPLAY_LIMIT = 5

export interface BoardRow {
  /** Stable unique key for list rendering */
  id: string
  entry: StationEntryWithDepartures
  departure: FormattedDeparture
}

/**
 * Flatten upcoming departures from all saved stations, sort by soonest,
 * and take the next 5 overall.
 */
export function useBoardRows() {
  const { stationEntries, refreshStation, refreshAll } = useStations()

  const boardRows = computed<BoardRow[]>(() => {
    const rows: BoardRow[] = []

    for (const entry of stationEntries.value) {
      for (const [index, departure] of entry.departures.entries()) {
        rows.push({
          id: `${entry.id}::${departure.departure.timestampMs}::${departure.line}::${index}`,
          entry,
          departure,
        })
      }
    }

    rows.sort(
      (a, b) =>
        a.departure.departure.timestampMs - b.departure.departure.timestampMs
    )

    return rows.slice(0, BOARD_DISPLAY_LIMIT)
  })

  return {
    boardRows,
    refreshStation,
    refreshAll,
  }
}
