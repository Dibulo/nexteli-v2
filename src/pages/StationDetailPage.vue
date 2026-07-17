<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowRight } from 'lucide-vue-next'
import { useTransportApi } from '@/composables/useTransportApi'
import { useStationsStore } from '@/stores/stations'
import { getCountdownLabel } from '@/utils/format'
import type { JourneyDeparture, SavedStationEntry } from '@/types/itinerary'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStationsStore()
const { getStationboardWithJourney, loading, error } = useTransportApi()

const entry = ref<SavedStationEntry | null>(null)
const journey = ref<JourneyDeparture | null>(null)
const unavailable = ref(false)

let refreshInterval: ReturnType<typeof setInterval> | undefined

const modeClass = computed(() => {
  if (!journey.value || journey.value.color) return null
  const mode = journey.value.mode
  if (mode === 'tram') return 'line-badge--tram'
  if (mode === 'bus') return 'line-badge--bus'
  return 'line-badge--train'
})

const badgeStyle = computed(() => {
  const color = journey.value?.color
  if (!color) return undefined
  return {
    backgroundColor: color.bg,
    color: color.fg,
  }
})

const editPath = computed(() => {
  const id = route.params.id as string
  return `/stations/edit/${encodeURIComponent(id)}`
})

function pickJourney(departures: JourneyDeparture[]): JourneyDeparture | null {
  if (departures.length === 0) return null

  const tsHint = Number(route.query.ts)
  const lineHint = typeof route.query.line === 'string' ? route.query.line : null

  let candidates = departures
  if (lineHint) {
    const byLine = candidates.filter((d) => d.line === lineHint)
    if (byLine.length > 0) candidates = byLine
  }

  if (Number.isFinite(tsHint)) {
    let best = candidates[0]
    let bestDiff = Math.abs(best.departure.timestampMs - tsHint)
    for (const d of candidates.slice(1)) {
      const diff = Math.abs(d.departure.timestampMs - tsHint)
      if (diff < bestDiff) {
        best = d
        bestDiff = diff
      }
    }
    return best
  }

  return candidates[0]
}

function stopLabel(stop: JourneyDeparture['stops'][number]): string {
  if (stop.isCurrent) return t('journey.currentStation')
  if (stop.arrivalTimestampMs == null) return '—'
  const label = getCountdownLabel(stop.arrivalTimestampMs)
  return label === 'now' ? t('departure.now') : label
}

async function loadJourney() {
  if (!entry.value) return

  unavailable.value = false
  let departures = await getStationboardWithJourney(entry.value.station.id)
  if (entry.value.direction) {
    departures = departures.filter((d) => d.to === entry.value!.direction)
  }

  const matched = pickJourney(departures)
  if (!matched) {
    journey.value = null
    unavailable.value = true
    return
  }

  journey.value = matched
}

onMounted(async () => {
  const id = route.params.id as string
  const existing = store.stationById(id)
  if (!existing) {
    router.replace('/stations')
    return
  }
  entry.value = existing
  await loadJourney()
  refreshInterval = setInterval(loadJourney, 60_000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>

<template>
  <div class="page-container">
    <div class="mb-8 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="page-title">{{ t('journey.title') }}</h1>
        <p v-if="entry" class="page-subtitle">
          {{ entry.station.name }}
        </p>
      </div>
      <router-link
        :to="editPath"
        class="btn btn-outline btn-sm shrink-0 rounded-xl"
      >
        {{ t('common.edit') }}
      </router-link>
    </div>

    <div class="surface-card p-6 sm:p-8">
      <div v-if="loading && !journey" class="flex items-center gap-2 py-8 text-sm opacity-75">
        <span class="loading loading-spinner loading-sm" />
        {{ t('stations.searching') }}
      </div>

      <div v-else-if="error" class="alert alert-warning text-sm">
        {{ t(error) }}
      </div>

      <div v-else-if="unavailable" class="alert alert-warning text-sm">
        {{ t('journey.unavailable') }}
      </div>

      <template v-else-if="journey">
        <div class="mb-6 flex items-center gap-3">
          <span class="line-badge" :class="modeClass" :style="badgeStyle">
            {{ journey.line }}
          </span>
          <span class="flex min-w-0 items-center gap-2 text-lg font-medium">
            <ArrowRight class="h-5 w-5 shrink-0 opacity-55" aria-hidden="true" />
            <span class="truncate">{{ journey.to }}</span>
          </span>
        </div>

        <ul
          v-if="journey.stops.length > 0"
          class="timeline timeline-vertical timeline-compact"
        >
          <li
            v-for="(stop, index) in journey.stops"
            :key="`${stop.stationId}-${index}`"
          >
            <hr v-if="index > 0" :class="stop.isCurrent ? 'bg-primary' : undefined" />
            <div
              class="timeline-middle"
              :class="stop.isCurrent ? 'text-primary' : 'opacity-70'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-5 w-5"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div
              class="timeline-end timeline-box flex w-full items-center justify-between gap-3"
              :class="stop.isCurrent ? 'border-primary font-semibold' : ''"
            >
              <span class="min-w-0 truncate">{{ stop.name }}</span>
              <span
                class="shrink-0 tabular-nums text-sm"
                :class="stop.isCurrent ? 'badge badge-primary badge-sm' : 'opacity-70'"
              >
                {{ stopLabel(stop) }}
              </span>
            </div>
            <hr
              v-if="index < journey.stops.length - 1"
              :class="stop.isCurrent ? 'bg-primary' : undefined"
            />
          </li>
        </ul>

        <p v-else class="py-4 text-sm opacity-75">
          {{ t('journey.empty') }}
        </p>
      </template>
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

<style scoped>
.line-badge {
  display: inline-flex;
  min-width: 3.25rem;
  height: 2.4rem;
  align-items: center;
  justify-content: center;
  padding-inline: 0.55rem;
  border-radius: 0.15rem;
  font-weight: 700;
  font-size: 1.35rem;
  line-height: 1;
  color: #fff;
  letter-spacing: 0.02em;
  font-family: var(--font-display);
}

.line-badge--train {
  background-color: var(--mode-train);
}

.line-badge--tram {
  background-color: var(--mode-tram);
}

.line-badge--bus {
  background-color: var(--mode-bus);
}
</style>
