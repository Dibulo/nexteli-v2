<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DepartureRow from '@/components/DepartureRow.vue'
import type { BoardRow } from '@/composables/useBoardRows'

defineProps<{
  rows: BoardRow[]
}>()

const emit = defineEmits<{
  expired: [entryId: string]
}>()

const { t } = useI18n()
</script>

<template>
  <section class="departure-board" :aria-label="t('board.title')">
    <div v-if="rows.length === 0" class="board-empty">
      {{ t('board.empty') }}
    </div>
    <ul v-else class="board-list">
      <li
        v-for="row in rows"
        :key="row.entry.id"
        class="board-item"
      >
        <DepartureRow :row="row" @expired="emit('expired', $event)" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.departure-board {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  background-color: var(--board-bg);
  color: var(--board-fg);
  font-family: var(--font-display);
  padding: clamp(0.75rem, 2.5vh, 1.75rem) clamp(1rem, 4vw, 3rem)
    clamp(1rem, 3vh, 2rem);
}

.board-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  list-style: none;
  margin: 0;
  padding: 0;
}

.board-item {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}

.board-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: var(--board-muted);
  letter-spacing: 0.1em;
  font-size: clamp(1.25rem, 4vw, 2.5rem);
  text-align: center;
}
</style>
