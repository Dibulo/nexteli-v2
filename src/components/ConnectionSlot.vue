<script setup lang="ts">
import { watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, ArrowRight } from 'lucide-vue-next'
import { useCountdown } from '@/composables/useCountdown'
import { formatTime, formatDurationMinutes } from '@/utils/format'
import type { FormattedConnection } from '@/types/itinerary'

const props = defineProps<{
  connection: FormattedConnection
}>()

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
</script>

<template>
  <div
    v-motion-fade
    class="card card-compact min-w-[180px] snap-start bg-base-200 p-3"
  >
    <!-- Countdown badge -->
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs font-semibold opacity-70">
        {{ connection.line }}
      </span>
      <span
        class="badge badge-lg font-bold tabular-nums"
        :class="countdownLabel === 'now' ? 'badge-primary' : 'badge-ghost'"
      >
        {{ countdownLabel === 'now' ? t('connection.now') : countdownLabel }}
      </span>
    </div>

    <!-- Times -->
    <div class="flex items-center gap-2 text-sm tabular-nums">
      <Clock class="size-3.5 opacity-50" />
      <span class="font-medium">{{ depTime }}</span>
      <ArrowRight class="size-3 opacity-40" />
      <span>{{ arrTime }}</span>
    </div>

    <!-- Duration + Platform -->
    <div class="mt-1 flex items-center gap-3 text-xs opacity-60">
      <span>{{ durationStr }}</span>
      <span v-if="connection.transfers > 0">
        {{ connection.transfers }}x
      </span>
      <span v-if="connection.departure.platform">
        {{ t('connection.platform') }} {{ connection.departure.platform }}
      </span>
    </div>
  </div>
</template>
