<script setup lang="ts">
import { watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, ArrowRight } from 'lucide-vue-next'
import { getTransportIcon } from '@/utils/transportIcons'
import { useCountdown } from '@/composables/useCountdown'
import { formatTime, formatDurationMinutes } from '@/utils/format'
import type { FormattedConnection } from '@/types/itinerary'

const props = withDefaults(
  defineProps<{
    connection: FormattedConnection
    featured?: boolean
  }>(),
  { featured: false },
)

const emit = defineEmits<{
  expired: []
}>()

const { t } = useI18n()
const { countdownLabel, expired } = useCountdown(
  computed(() => props.connection.departure.timestampMs)
)

watch(expired, (val) => {
  if (val) emit('expired')
})

const depTime = formatTime(props.connection.departure.iso)
const arrTime = formatTime(props.connection.arrival.iso)
const durationStr = formatDurationMinutes(props.connection.durationSeconds)
const transportIcon = computed(() => getTransportIcon(props.connection.mode))
const isNow = computed(() => countdownLabel.value === 'now')
</script>

<template>
  <div class="relative min-w-[200px] snap-start">
    <span
      v-if="featured"
      class="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 badge badge-xs badge-primary font-bold uppercase tracking-wide"
    >
      {{ t('connection.next') }}
    </span>

    <div
      v-motion-fade
      class="group rounded-xl border p-4 transition-all"
      :class="
        featured
          ? 'border-primary/40 bg-base-100 shadow-sm ring-1 ring-primary/15 hover:border-primary/55'
          : 'border-base-300/50 bg-base-200/60 hover:border-base-300 hover:bg-base-200'
      "
    >
    <!-- Countdown badge -->
    <div class="mb-3 flex items-center justify-between gap-2">
      <span
        class="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-base-content/70"
      >
        <component :is="transportIcon" class="size-3.5 shrink-0" />
        <span class="truncate">{{ connection.line }}</span>
      </span>
      <span
        class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
        :class="
          isNow
            ? 'bg-primary text-primary-content'
            : 'bg-base-300/50 text-base-content/80'
        "
      >
        {{ isNow ? t('connection.now') : countdownLabel }}
      </span>
    </div>

    <!-- Times -->
    <div class="flex items-center gap-2 text-sm tabular-nums">
      <Clock class="size-3.5 text-base-content/40" />
      <span class="font-semibold">{{ depTime }}</span>
      <ArrowRight class="size-3 text-base-content/30" />
      <span class="text-base-content/80">{{ arrTime }}</span>
    </div>

    <!-- Duration + Platform -->
    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/50">
      <span>{{ durationStr }}</span>
      <span v-if="connection.transfers > 0">
        {{ connection.transfers }}x
      </span>
      <span v-if="connection.departure.platform">
        {{ t('connection.platform') }} {{ connection.departure.platform }}
      </span>
    </div>
    </div>
  </div>
</template>
