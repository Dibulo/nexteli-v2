<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  GripVertical,
  MoreVertical,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import DepartureSlot from './DepartureSlot.vue'
import { useStations } from '@/composables/useStations'
import type { StationEntryWithDepartures } from '@/types/itinerary'

const props = defineProps<{
  entry: StationEntryWithDepartures
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const { t } = useI18n()
const { refreshStation } = useStations()

const menuOpen = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)
let autoRefresh: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  autoRefresh = setInterval(() => refreshStation(props.entry.id), 60_000)
})

onUnmounted(() => {
  clearInterval(autoRefresh)
})

function handleExpired() {
  refreshStation(props.entry.id)
}

function handleRemove() {
  menuOpen.value = false
  if (confirm(t('stations.removeConfirm'))) {
    emit('remove', props.entry.id)
  }
}

function scrollLeft() {
  scrollContainer.value?.scrollBy({ left: -200, behavior: 'smooth' })
}

function scrollRight() {
  scrollContainer.value?.scrollBy({ left: 200, behavior: 'smooth' })
}
</script>

<template>
  <div
    v-motion-slide-visible-bottom
    class="surface-card surface-card-interactive"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 px-5 pt-5 sm:gap-3 sm:px-6">
      <button
        type="button"
        class="station-drag-handle btn btn-ghost btn-sm btn-circle shrink-0 opacity-40 hover:opacity-100"
        :aria-label="t('stations.reorder')"
      >
        <GripVertical class="size-4" />
      </button>
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="truncate text-base font-semibold tracking-tight sm:text-lg">
          {{ entry.station.name }}
        </span>
        <template v-if="entry.direction">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/50"
          >
            <ArrowRight class="size-3.5" />
          </span>
          <span class="truncate text-base font-semibold tracking-tight sm:text-lg">
            {{ entry.direction }}
          </span>
        </template>
        <span
          v-else
          class="ml-1 shrink-0 rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-medium text-base-content/60"
        >
          {{ t('station.allDirections') }}
        </span>
      </div>

      <!-- Menu -->
      <div class="dropdown dropdown-end">
        <button
          class="btn btn-ghost btn-sm btn-circle opacity-60 hover:opacity-100"
          @click="menuOpen = !menuOpen"
        >
          <MoreVertical class="size-4" />
        </button>
        <ul
          v-if="menuOpen"
          class="menu dropdown-content z-10 w-48 rounded-xl border border-base-300/40 bg-base-100 p-2 shadow-lg"
        >
          <li>
            <button @click="refreshStation(entry.id); menuOpen = false">
              <RefreshCw class="size-4" />
              {{ t('stations.refresh') }}
            </button>
          </li>
          <li>
            <button class="text-error" @click="handleRemove">
              <Trash2 class="size-4" />
              {{ t('stations.remove') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Departures -->
    <div class="relative px-5 pb-5 pt-5 sm:px-6">
      <!-- Loading -->
      <div
        v-if="entry.loading && entry.departures.length === 0"
        class="flex items-stretch gap-3"
      >
        <template v-for="i in 3" :key="i">
          <div
            class="skeleton h-28 min-w-[200px] rounded-xl"
            :class="i === 1 ? 'ring-1 ring-primary/15' : ''"
          />
          <div
            v-if="i === 1"
            class="w-px shrink-0 self-stretch bg-base-300/60"
            aria-hidden="true"
          />
        </template>
      </div>

      <!-- Error -->
      <div
        v-else-if="entry.error"
        class="alert alert-error flex items-center gap-2 rounded-xl text-sm"
      >
        <span>{{ t(entry.error) }}</span>
        <button
          class="btn btn-ghost btn-xs"
          @click="refreshStation(entry.id)"
        >
          <RefreshCw class="size-3" />
        </button>
      </div>

      <!-- Departure slots -->
      <div v-else class="flex items-center gap-1">
        <button
          class="btn btn-ghost btn-xs btn-circle hidden opacity-50 hover:opacity-100 sm:flex"
          @click="scrollLeft"
        >
          <ChevronLeft class="size-4" />
        </button>

        <div
          ref="scrollContainer"
          class="flex flex-1 items-stretch gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 pt-3"
        >
          <template v-for="(dep, idx) in entry.departures" :key="idx">
            <DepartureSlot
              :departure="dep"
              :featured="idx === 0"
              @expired="handleExpired"
            />
            <div
              v-if="idx === 0 && entry.departures.length > 1"
              class="w-px shrink-0 self-stretch bg-base-300/60"
              aria-hidden="true"
            />
          </template>
          <div
            v-if="entry.departures.length === 0"
            class="w-full py-6 text-center text-sm opacity-50"
          >
            {{ t('stations.empty') }}
          </div>
        </div>

        <button
          class="btn btn-ghost btn-xs btn-circle hidden opacity-50 hover:opacity-100 sm:flex"
          @click="scrollRight"
        >
          <ChevronRight class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
