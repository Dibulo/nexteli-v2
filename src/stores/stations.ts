import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SavedStationEntry, FormattedDeparture } from '@/types/itinerary'
import type { Station } from '@/types/transport'
import { loadStations, saveStations } from '@/utils/storage'
import { useTransportApi } from '@/composables/useTransportApi'

const CACHE_TTL = 30_000
const DISPLAY_LIMIT = 5

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<SavedStationEntry[]>([])
  const departuresByEntryId = ref<Record<string, FormattedDeparture[]>>({})
  const loadingIds = ref<Set<string>>(new Set())
  const errorsById = ref<Record<string, string | null>>({})
  const lastFetchedAtById = ref<Record<string, number>>({})

  const hasStations = computed(() => stations.value.length > 0)

  const sortedStations = computed(() => stations.value)

  function stationById(id: string): SavedStationEntry | undefined {
    return stations.value.find((s) => s.id === id)
  }

  function departuresForEntry(id: string) {
    return {
      departures: departuresByEntryId.value[id] ?? [],
      loading: loadingIds.value.has(id),
      error: errorsById.value[id] ?? null,
    }
  }

  function hydrate() {
    stations.value = loadStations().sort(
      (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
    )
    saveStations(stations.value)
  }

  function setStationOrder(ordered: SavedStationEntry[]) {
    stations.value = ordered
    saveStations(stations.value)
  }

  function addStation(station: Station, direction: string | null): boolean {
    const id = `${station.id}::${direction ?? '*'}`
    if (stations.value.some((s) => s.id === id)) return false

    const entry: SavedStationEntry = {
      id,
      createdAt: Date.now(),
      station: {
        id: station.id,
        name: station.name,
        icon: station.icon,
      },
      direction,
    }

    stations.value.push(entry)
    saveStations(stations.value)
    fetchDepartures(id, true)
    return true
  }

  function removeStation(id: string) {
    stations.value = stations.value.filter((s) => s.id !== id)
    delete departuresByEntryId.value[id]
    delete errorsById.value[id]
    delete lastFetchedAtById.value[id]
    loadingIds.value.delete(id)
    saveStations(stations.value)
  }

  function clearAll() {
    stations.value = []
    departuresByEntryId.value = {}
    loadingIds.value.clear()
    errorsById.value = {}
    lastFetchedAtById.value = {}
    saveStations([])
  }

  async function fetchDepartures(entryId: string, force = false) {
    const entry = stationById(entryId)
    if (!entry) return

    const lastFetch = lastFetchedAtById.value[entryId]
    if (!force && lastFetch && Date.now() - lastFetch < CACHE_TTL) return

    loadingIds.value.add(entryId)
    errorsById.value[entryId] = null

    const { getStationboard } = useTransportApi()

    try {
      let departures = await getStationboard(entry.station.id, 30)
      if (entry.direction) {
        departures = departures.filter((d) => d.to === entry.direction)
      }
      departuresByEntryId.value[entryId] = departures.slice(0, DISPLAY_LIMIT)
      lastFetchedAtById.value[entryId] = Date.now()
    } catch {
      errorsById.value[entryId] = 'errors.apiUnavailable'
    } finally {
      loadingIds.value.delete(entryId)
    }
  }

  async function refreshAll() {
    const promises = stations.value.map((s) => fetchDepartures(s.id))
    await Promise.all(promises)
  }

  return {
    stations,
    departuresByEntryId,
    loadingIds,
    errorsById,
    lastFetchedAtById,
    hasStations,
    sortedStations,
    stationById,
    departuresForEntry,
    hydrate,
    setStationOrder,
    addStation,
    removeStation,
    clearAll,
    fetchDepartures,
    refreshAll,
  }
})
