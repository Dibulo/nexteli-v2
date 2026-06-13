import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SavedRoute, FormattedConnection } from '@/types/itinerary'
import type { Station } from '@/types/transport'
import { loadRoutes, saveRoutes } from '@/utils/storage'
import { useTransportApi } from '@/composables/useTransportApi'

const CACHE_TTL = 30_000

export const useItinerariesStore = defineStore('itineraries', () => {
  const routes = ref<SavedRoute[]>([])
  const connectionsByRouteId = ref<Record<string, FormattedConnection[]>>({})
  const loadingRouteIds = ref<Set<string>>(new Set())
  const errorsByRouteId = ref<Record<string, string | null>>({})
  const lastFetchedAtByRouteId = ref<Record<string, number>>({})

  const hasRoutes = computed(() => routes.value.length > 0)

  const sortedRoutes = computed(() => routes.value)

  function routeById(id: string): SavedRoute | undefined {
    return routes.value.find((r) => r.id === id)
  }

  function connectionsForRoute(id: string) {
    return {
      connections: connectionsByRouteId.value[id] ?? [],
      loading: loadingRouteIds.value.has(id),
      error: errorsByRouteId.value[id] ?? null,
    }
  }

  function hydrate() {
    routes.value = loadRoutes().sort(
      (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
    )
    saveRoutes(routes.value)
  }

  function setRouteOrder(orderedRoutes: SavedRoute[]) {
    routes.value = orderedRoutes
    saveRoutes(routes.value)
  }

  function addRoute(departure: Station, destination: Station): boolean {
    const id = `${departure.id}::${destination.id}`
    if (routes.value.some((r) => r.id === id)) return false

    const newRoute: SavedRoute = {
      id,
      createdAt: Date.now(),
      departure: {
        id: departure.id,
        name: departure.name,
        icon: departure.icon,
      },
      destination: {
        id: destination.id,
        name: destination.name,
        icon: destination.icon,
      },
    }

    routes.value.push(newRoute)
    saveRoutes(routes.value)
    fetchConnections(id, true)
    return true
  }

  function removeRoute(id: string) {
    routes.value = routes.value.filter((r) => r.id !== id)
    delete connectionsByRouteId.value[id]
    delete errorsByRouteId.value[id]
    delete lastFetchedAtByRouteId.value[id]
    loadingRouteIds.value.delete(id)
    saveRoutes(routes.value)
  }

  function clearAll() {
    routes.value = []
    connectionsByRouteId.value = {}
    loadingRouteIds.value.clear()
    errorsByRouteId.value = {}
    lastFetchedAtByRouteId.value = {}
    saveRoutes([])
  }

  async function fetchConnections(routeId: string, force = false) {
    const route = routeById(routeId)
    if (!route) return

    const lastFetch = lastFetchedAtByRouteId.value[routeId]
    if (!force && lastFetch && Date.now() - lastFetch < CACHE_TTL) return

    loadingRouteIds.value.add(routeId)
    errorsByRouteId.value[routeId] = null

    const { getConnections } = useTransportApi()

    try {
      const connections = await getConnections(
        route.departure.id,
        route.destination.id
      )
      connectionsByRouteId.value[routeId] = connections
      lastFetchedAtByRouteId.value[routeId] = Date.now()
    } catch {
      errorsByRouteId.value[routeId] = 'errors.apiUnavailable'
    } finally {
      loadingRouteIds.value.delete(routeId)
    }
  }

  async function refreshAll() {
    const promises = routes.value.map((r) => fetchConnections(r.id))
    await Promise.all(promises)
  }

  return {
    routes,
    connectionsByRouteId,
    loadingRouteIds,
    errorsByRouteId,
    lastFetchedAtByRouteId,
    hasRoutes,
    sortedRoutes,
    routeById,
    connectionsForRoute,
    hydrate,
    setRouteOrder,
    addRoute,
    removeRoute,
    clearAll,
    fetchConnections,
    refreshAll,
  }
})
