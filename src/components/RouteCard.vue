<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  MoreVertical,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import ConnectionSlot from './ConnectionSlot.vue'
import { useItineraries } from '@/composables/useItineraries'
import type { RouteWithConnections } from '@/types/itinerary'

const props = defineProps<{
  route: RouteWithConnections
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const { t } = useI18n()
const { refreshRoute } = useItineraries()

const menuOpen = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)
let autoRefresh: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  autoRefresh = setInterval(() => refreshRoute(props.route.id), 60_000)
})

onUnmounted(() => {
  clearInterval(autoRefresh)
})

function handleExpired() {
  refreshRoute(props.route.id)
}

function handleRemove() {
  menuOpen.value = false
  if (confirm(t('routes.removeConfirm'))) {
    emit('remove', props.route.id)
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
  <div v-motion-slide-visible-bottom class="card bg-base-100 shadow-md">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 pt-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 text-lg font-semibold">
          <span>{{ route.departure.name }}</span>
          <ArrowRight class="size-4 opacity-50" />
          <span>{{ route.destination.name }}</span>
        </div>
      </div>

      <!-- Menu -->
      <div class="dropdown dropdown-end">
        <button
          class="btn btn-ghost btn-sm btn-square"
          @click="menuOpen = !menuOpen"
        >
          <MoreVertical class="size-4" />
        </button>
        <ul
          v-if="menuOpen"
          class="menu dropdown-content z-10 w-48 rounded-box bg-base-100 p-2 shadow-lg"
        >
          <li>
            <button @click="refreshRoute(route.id); menuOpen = false">
              <RefreshCw class="size-4" />
              {{ t('routes.refresh') }}
            </button>
          </li>
          <li>
            <button class="text-error" @click="handleRemove">
              <Trash2 class="size-4" />
              {{ t('routes.remove') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Connections -->
    <div class="relative px-4 pb-4 pt-2">
      <!-- Loading -->
      <div
        v-if="route.loading && route.connections.length === 0"
        class="flex gap-3"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="skeleton h-24 min-w-[180px] rounded-xl"
        />
      </div>

      <!-- Error -->
      <div
        v-else-if="route.error"
        class="alert alert-error flex items-center gap-2 text-sm"
      >
        <span>{{ t(route.error) }}</span>
        <button
          class="btn btn-ghost btn-xs"
          @click="refreshRoute(route.id)"
        >
          <RefreshCw class="size-3" />
        </button>
      </div>

      <!-- Connection slots -->
      <div v-else class="flex items-center gap-1">
        <button
          class="btn btn-ghost btn-xs btn-circle hidden sm:flex"
          @click="scrollLeft"
        >
          <ChevronLeft class="size-4" />
        </button>

        <div
          ref="scrollContainer"
          class="flex flex-1 gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
        >
          <ConnectionSlot
            v-for="(conn, idx) in route.connections"
            :key="idx"
            :connection="conn"
            @expired="handleExpired"
          />
          <div
            v-if="route.connections.length === 0"
            class="py-4 text-center text-sm opacity-50"
          >
            {{ t('routes.empty') }}
          </div>
        </div>

        <button
          class="btn btn-ghost btn-xs btn-circle hidden sm:flex"
          @click="scrollRight"
        >
          <ChevronRight class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
