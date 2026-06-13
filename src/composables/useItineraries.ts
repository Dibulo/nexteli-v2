import { computed } from 'vue'
import { useItinerariesStore } from '@/stores/itineraries'
import type { RouteWithConnections } from '@/types/itinerary'
import type { SavedStation } from '@/types/itinerary'

export function useItineraries() {
  const store = useItinerariesStore()

  const routes = computed<RouteWithConnections[]>(() =>
    store.sortedRoutes.map((r) => {
      const { connections, loading, error } = store.connectionsForRoute(r.id)
      return {
        ...r,
        connections,
        loading,
        error,
        lastFetchedAt: store.lastFetchedAtByRouteId?.[r.id] ?? null,
      } satisfies RouteWithConnections
    })
  )

  const hasRoutes = computed(() => store.hasRoutes)

  function addRoute(departure: SavedStation, destination: SavedStation): boolean {
    return store.addRoute(
      {
        id: departure.id,
        name: departure.name,
        score: null,
        coordinate: { type: 'WGS84', x: 0, y: 0 },
        icon: departure.icon,
      },
      {
        id: destination.id,
        name: destination.name,
        score: null,
        coordinate: { type: 'WGS84', x: 0, y: 0 },
        icon: destination.icon,
      }
    )
  }

  function removeRoute(id: string) {
    store.removeRoute(id)
  }

  function refreshRoute(id: string) {
    store.fetchConnections(id, true)
  }

  function refreshAll() {
    store.refreshAll()
  }

  return {
    routes,
    hasRoutes,
    addRoute,
    removeRoute,
    refreshRoute,
    refreshAll,
  }
}
