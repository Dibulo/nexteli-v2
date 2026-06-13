<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StationSearch from '@/components/StationSearch.vue'
import { useItineraries } from '@/composables/useItineraries'
import { useItinerariesStore } from '@/stores/itineraries'
import type { SavedStation } from '@/types/itinerary'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useItinerariesStore()
const { removeRoute } = useItineraries()

const departure = ref<SavedStation | null>(null)
const destination = ref<SavedStation | null>(null)
const errorMsg = ref<string | null>(null)

onMounted(() => {
  const id = route.params.id as string
  const existing = store.routeById(id)
  if (!existing) {
    router.replace('/routes')
    return
  }
  departure.value = { ...existing.departure }
  destination.value = { ...existing.destination }
})

function handleSave() {
  if (!departure.value || !destination.value) return

  if (departure.value.id === destination.value.id) {
    errorMsg.value = t('route.sameStation')
    return
  }

  const oldId = route.params.id as string
  store.removeRoute(oldId)

  const newId = `${departure.value.id}::${destination.value.id}`
  const existingWithNewId = store.routeById(newId)
  if (existingWithNewId) {
    errorMsg.value = t('route.duplicate')
    return
  }

  store.addRoute(
    {
      id: departure.value.id,
      name: departure.value.name,
      score: null,
      coordinate: { type: 'WGS84', x: 0, y: 0 },
      icon: departure.value.icon,
    },
    {
      id: destination.value.id,
      name: destination.value.name,
      score: null,
      coordinate: { type: 'WGS84', x: 0, y: 0 },
      icon: destination.value.icon,
    }
  )

  router.push('/routes')
}

function handleDelete() {
  if (!confirm(t('routes.removeConfirm'))) return
  removeRoute(route.params.id as string)
  router.push(store.hasRoutes ? '/routes' : '/route/new')
}
</script>

<template>
  <div class="page-container">
    <div class="mb-8">
      <h1 class="page-title">{{ t('route.edit') }}</h1>
      <p class="page-subtitle">
        {{ t('route.departure') }} → {{ t('route.destination') }}
      </p>
    </div>

    <div class="surface-card p-6 sm:p-8">
      <div class="flex flex-col gap-5">
        <StationSearch
          v-model="departure"
          :label="t('route.departure')"
          :placeholder="t('route.departure')"
        />
        <StationSearch
          v-model="destination"
          :label="t('route.destination')"
          :placeholder="t('route.destination')"
        />

        <div v-if="errorMsg" class="alert alert-warning text-sm">
          {{ errorMsg }}
        </div>

        <button
          class="btn btn-primary mt-1 w-full rounded-xl"
          @click="handleSave"
        >
          {{ t('common.save') }}
        </button>
        <button
          class="btn btn-error btn-outline w-full rounded-xl"
          @click="handleDelete"
        >
          {{ t('common.delete') }}
        </button>
      </div>
    </div>

    <div class="mt-6 text-center">
      <router-link
        to="/routes"
        class="link link-primary text-sm font-medium opacity-80 hover:opacity-100"
      >
        {{ t('nav.back') }}
      </router-link>
    </div>
  </div>
</template>
