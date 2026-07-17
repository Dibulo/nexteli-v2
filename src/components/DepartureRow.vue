<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import { getTransportIcon } from '@/utils/transportIcons'
import { useCountdown } from '@/composables/useCountdown'
import type { BoardRow } from '@/composables/useBoardRows'

const props = defineProps<{
  row: BoardRow
}>()

const emit = defineEmits<{
  expired: [entryId: string]
}>()

const { t } = useI18n()
const router = useRouter()

const timestampMs = computed(
  () =>
    props.row.departure?.departure.timestampMs ?? Number.MAX_SAFE_INTEGER
)

const { countdownLabel, expired } = useCountdown(timestampMs)

watch(expired, (val) => {
  if (val && props.row.departure) {
    emit('expired', props.row.entry.id)
  }
})

const isNow = computed(
  () => Boolean(props.row.departure) && countdownLabel.value === 'now'
)

const transportIcon = computed(() =>
  getTransportIcon(props.row.departure?.mode)
)

const modeClass = computed(() => {
  const mode = props.row.departure?.mode
  if (mode === 'tram') return 'line-badge--tram'
  if (mode === 'bus') return 'line-badge--bus'
  return 'line-badge--train'
})

const lineLabel = computed(() => {
  if (!props.row.departure) return '—'
  return props.row.departure.line
})

const showPlaceholder = computed(
  () =>
    !props.row.departure ||
    props.row.entry.loading ||
    Boolean(props.row.entry.error)
)

function openEdit() {
  router.push(`/stations/edit/${encodeURIComponent(props.row.entry.id)}`)
}
</script>

<template>
  <button
    type="button"
    class="departure-row"
    :aria-label="
      t('board.rowAria', {
        line: lineLabel,
        station: row.entry.station.name,
        countdown: isNow ? t('departure.now') : countdownLabel || '—',
      })
    "
    @click="openEdit"
  >
    <span class="line-badge" :class="modeClass">{{ lineLabel }}</span>

    <span class="station-col">
      <span class="station-name">{{ row.entry.station.name }}</span>
      <span v-if="row.entry.direction" class="direction">
        <ArrowRight class="direction-icon" aria-hidden="true" />
        <span class="direction-name">{{ row.entry.direction }}</span>
      </span>
    </span>

    <span class="countdown-col">
      <template v-if="row.entry.error">
        <span class="countdown-muted">—</span>
      </template>
      <template v-else-if="showPlaceholder && !row.departure">
        <span class="countdown-muted">···</span>
      </template>
      <template v-else-if="isNow">
        <component
          :is="transportIcon"
          class="now-icon"
          :aria-label="t('departure.now')"
        />
      </template>
      <template v-else>
        <span class="countdown">{{ countdownLabel }}</span>
      </template>
    </span>
  </button>
</template>

<style scoped>
.departure-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(0.75rem, 2.5vw, 2rem);
  width: 100%;
  padding: clamp(0.65rem, 1.8vh, 1.1rem) 0;
  text-align: left;
  color: var(--board-fg);
  font-family: var(--font-display);
  letter-spacing: 0.06em;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.departure-row:hover,
.departure-row:focus-visible {
  background-color: color-mix(in oklch, var(--board-fg) 6%, transparent);
  outline: none;
}

.line-badge {
  display: inline-flex;
  min-width: clamp(3.25rem, 8vw, 5.5rem);
  height: clamp(2.4rem, 7vh, 4rem);
  align-items: center;
  justify-content: center;
  padding-inline: clamp(0.45rem, 1.2vw, 0.85rem);
  border-radius: 0.15rem;
  font-weight: 700;
  font-size: clamp(1.35rem, 4.5vw, 2.75rem);
  line-height: 1;
  color: #fff;
  letter-spacing: 0.02em;
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

.station-col {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: clamp(0.5rem, 1.5vw, 1rem);
}

.station-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(1.5rem, 5.5vw, 3.5rem);
  font-weight: 400;
  line-height: 1.15;
}

.direction {
  display: none;
  min-width: 0;
  align-items: center;
  gap: 0.35rem;
  color: var(--board-muted);
  font-size: clamp(1rem, 2.8vw, 1.75rem);
}

@media (min-width: 768px) {
  .direction {
    display: inline-flex;
  }
}

.direction-icon {
  width: clamp(1rem, 2vw, 1.5rem);
  height: clamp(1rem, 2vw, 1.5rem);
  flex-shrink: 0;
}

.direction-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.countdown-col {
  display: flex;
  min-width: clamp(3.5rem, 10vw, 7rem);
  justify-content: flex-end;
  align-items: center;
}

.countdown {
  font-size: clamp(1.75rem, 6vw, 3.75rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.countdown-muted {
  color: var(--board-muted);
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: 0.15em;
}

.now-icon {
  width: clamp(2rem, 6vw, 3.5rem);
  height: clamp(2rem, 6vw, 3.5rem);
  color: var(--mode-now);
  stroke-width: 2.1;
}
</style>
