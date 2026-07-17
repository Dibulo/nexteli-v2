<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AboutCard from '@/components/AboutCard.vue'
import StationSearch from '@/components/StationSearch.vue'
import { useStations } from '@/composables/useStations'
import type { SavedStation } from '@/types/itinerary'

const { t } = useI18n()
const router = useRouter()
const { hasStations, addStation, getDirectionOptions } = useStations()

const station = ref<SavedStation | null>(null)
const direction = ref<string | null>(null)
const directionOptions = ref<string[]>([])
const loadingDirections = ref(false)
const errorMsg = ref<string | null>(null)

const canSubmit = computed(() => station.value !== null)

watch(station, async (val) => {
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

function handleSubmit() {
  if (!station.value) return

  const added = addStation(station.value, direction.value)
  if (!added) {
    errorMsg.value = t('station.duplicate')
    return
  }

  router.push('/stations')
}
</script>

<template>
  <div class="page-container">
    <AboutCard
      v-motion-fade
      v-if="!hasStations"
      class="mb-8"
    />

    <div class="surface-card p-6 sm:p-8">
      <h2 class="text-lg font-semibold tracking-tight">{{ t('nav.addStation') }}</h2>
      <div class="mt-2 flex flex-col gap-5">
        <StationSearch
          v-model="station"
          :label="t('station.label')"
          :placeholder="t('station.placeholder')"
        />

        <div v-if="station">
          <label class="label pb-2">
            <span class="label-text text-sm font-medium opacity-80">
              {{ t('station.direction') }}
            </span>
          </label>

          <div v-if="loadingDirections" class="flex items-center gap-2 py-2 text-sm opacity-60">
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
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ t('station.submit') }}
        </button>
      </div>
    </div>

    <div v-if="hasStations" class="mt-6 text-center">
      <router-link
        to="/stations"
        class="link link-primary text-sm font-medium opacity-80 hover:opacity-100"
      >
        {{ t('nav.back') }}
      </router-link>
    </div>
  </div>
</template>
