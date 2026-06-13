<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  ArrowLeftRight,
  GripVertical,
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
const { refreshRoute, addRoute, routes } = useItineraries()

const reverseRouteId = computed(
  () => `${props.route.destination.id}::${props.route.departure.id}`
)
const hasReverseRoute = computed(() =>
  routes.value.some((r) => r.id === reverseRouteId.value)
)

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

function handleAddReverseRoute() {
  menuOpen.value = false
  addRoute(props.route.destination, props.route.departure)
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
        class="route-drag-handle btn btn-ghost btn-sm btn-circle shrink-0 opacity-40 hover:opacity-100"
        :aria-label="t('routes.reorder')"
      >
        <GripVertical class="size-4" />
      </button>
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="truncate text-base font-semibold tracking-tight sm:text-lg">
          {{ route.departure.name }}
        </span>
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/50"
        >
          <ArrowRight class="size-3.5" />
        </span>
        <span class="truncate text-base font-semibold tracking-tight sm:text-lg">
          {{ route.destination.name }}
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
            <button @click="refreshRoute(route.id); menuOpen = false">
              <RefreshCw class="size-4" />
              {{ t('routes.refresh') }}
            </button>
          </li>
          <li v-if="!hasReverseRoute">
            <button @click="handleAddReverseRoute">
              <ArrowLeftRight class="size-4" />
              {{ t('routes.addReverse') }}
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
    <div class="relative px-5 pb-5 pt-5 sm:px-6">
      <!-- Loading -->
      <div
        v-if="route.loading && route.connections.length === 0"
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
        v-else-if="route.error"
        class="alert alert-error flex items-center gap-2 rounded-xl text-sm"
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
          class="btn btn-ghost btn-xs btn-circle hidden opacity-50 hover:opacity-100 sm:flex"
          @click="scrollLeft"
        >
          <ChevronLeft class="size-4" />
        </button>

        <div
          ref="scrollContainer"
          class="flex flex-1 items-stretch gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 pt-3"
        >
          <template v-for="(conn, idx) in route.connections" :key="idx">
            <ConnectionSlot
              :connection="conn"
              :featured="idx === 0"
              @expired="handleExpired"
            />
            <div
              v-if="idx === 0 && route.connections.length > 1"
              class="w-px shrink-0 self-stretch bg-base-300/60"
              aria-hidden="true"
            />
          </template>
          <div
            v-if="route.connections.length === 0"
            class="w-full py-6 text-center text-sm opacity-50"
          >
            {{ t('routes.empty') }}
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
