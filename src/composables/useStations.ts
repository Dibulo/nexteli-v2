import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStationsStore } from '@/stores/stations'
import type {
  StationEntryWithDepartures,
  SavedStationEntry,
  SavedStation,
} from '@/types/itinerary'
import { useTransportApi } from '@/composables/useTransportApi'

export function useStations() {
  const store = useStationsStore()
  const { stations: savedStations } = storeToRefs(store)

  const stationEntries = computed<StationEntryWithDepartures[]>(() =>
    store.sortedStations.map((s) => {
      const { departures, loading, error } = store.departuresForEntry(s.id)
      return {
        ...s,
        departures,
        loading,
        error,
        lastFetchedAt: store.lastFetchedAtById?.[s.id] ?? null,
      } satisfies StationEntryWithDepartures
    })
  )

  const hasStations = computed(() => store.hasStations)

  function addStation(
    station: SavedStation,
    direction: string | null
  ): boolean {
    return store.addStation(
      {
        id: station.id,
        name: station.name,
        score: null,
        coordinate: { type: 'WGS84', x: 0, y: 0 },
        icon: station.icon,
      },
      direction
    )
  }

  function removeStation(id: string) {
    store.removeStation(id)
  }

  function refreshStation(id: string) {
    store.fetchDepartures(id, true)
  }

  function refreshAll() {
    store.refreshAll()
  }

  function setStationOrder(ordered: SavedStationEntry[]) {
    store.setStationOrder(ordered)
  }

  async function getDirectionOptions(stationId: string): Promise<string[]> {
    const { getStationboard } = useTransportApi()
    const departures = await getStationboard(stationId, 30)
    const seen = new Set<string>()
    const options: string[] = []
    for (const d of departures) {
      if (!d.to || seen.has(d.to)) continue
      seen.add(d.to)
      options.push(d.to)
    }
    return options
  }

  return {
    stationEntries,
    savedStations,
    hasStations,
    addStation,
    removeStation,
    refreshStation,
    refreshAll,
    setStationOrder,
    getDirectionOptions,
  }
}
