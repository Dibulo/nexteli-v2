<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StationSearch from '@/components/StationSearch.vue'
import { useStations } from '@/composables/useStations'
import { useStationsStore } from '@/stores/stations'
import type { SavedStation } from '@/types/itinerary'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStationsStore()
const { removeStation, addStation, getDirectionOptions } = useStations()

const station = ref<SavedStation | null>(null)
const direction = ref<string | null>(null)
const directionOptions = ref<string[]>([])
const loadingDirections = ref(false)
const errorMsg = ref<string | null>(null)
const skipNextStationWatch = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  const existing = store.stationById(id)
  if (!existing) {
    router.replace('/stations')
    return
  }
  station.value = { ...existing.station }
  direction.value = existing.direction

  loadingDirections.value = true
  try {
    directionOptions.value = await getDirectionOptions(existing.station.id)
  } finally {
    loadingDirections.value = false
    skipNextStationWatch.value = false
  }
})

watch(station, async (val) => {
  if (skipNextStationWatch.value) return
  direction.value = null
  directionOptions.value = []
  errorMsg.value = null
  if (!val) return

  loadingDirections.value = true
  try {
    directionOptions.value = await getDirectionOptions(val.id)
  } finally {
    loadingDirections.value = false
  }
})

function selectDirection(value: string | null) {
  direction.value = value
}

function handleSave() {
  if (!station.value) return

  const oldId = route.params.id as string
  const newId = `${station.value.id}::${direction.value ?? '*'}`

  if (newId !== oldId && store.stationById(newId)) {
    errorMsg.value = t('station.duplicate')
    return
  }

  store.removeStation(oldId)
  const added = addStation(station.value, direction.value)
  if (!added) {
    errorMsg.value = t('station.duplicate')
    return
  }

  router.push('/stations')
}

function handleDelete() {
  if (!confirm(t('stations.removeConfirm'))) return
  removeStation(route.params.id as string)
  router.push(store.hasStations ? '/stations' : '/station/new')
}
</script>

<template>
  <div class="page-container">
    <div class="mb-8">
      <h1 class="page-title">{{ t('station.edit') }}</h1>
      <p class="page-subtitle">
        {{ t('station.label') }}
      </p>
    </div>

    <div class="surface-card p-6 sm:p-8">
      <div class="flex flex-col gap-5">
        <StationSearch
          v-model="station"
          :label="t('station.label')"
          :placeholder="t('station.label')"
        />

        <div v-if="station">
          <label class="label pb-2">
            <span class="label-text text-sm font-medium opacity-80">
              {{ t('station.direction') }}
            </span>
          </label>

          <div v-if="loadingDirections" class="flex items-center gap-2 py-2 text-sm opacity-75">
            <span class="loading loading-spinner loading-sm" />
            {{ t('stations.searching') }}
          </div>

          <div v-else class="flex flex-wrap gap-2">
            <button
              type="button"
              class="btn btn-sm rounded-full"
              :class="direction === null ? 'btn-primary' : 'btn-ghost border border-base-300'"
              @click="selectDirection(null)"
            >
              {{ t('station.allDirections') }}
            </button>
            <button
              v-for="opt in directionOptions"
              :key="opt"
              type="button"
              class="btn btn-sm rounded-full"
              :class="direction === opt ? 'btn-primary' : 'btn-ghost border border-base-300'"
              @click="selectDirection(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="alert alert-warning text-sm">
          {{ errorMsg }}
        </div>

        <button
          class="btn btn-primary mt-1 w-full rounded-xl"
          :disabled="!station"
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
        to="/stations"
        class="link link-primary text-sm font-medium opacity-80 hover:opacity-100"
      >
        {{ t('nav.back') }}
      </router-link>
    </div>
  </div>
</template>
