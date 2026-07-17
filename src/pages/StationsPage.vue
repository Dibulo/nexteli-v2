<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import DepartureBoard from '@/components/DepartureBoard.vue'
import { useBoardRows } from '@/composables/useBoardRows'

const { boardRows, refreshStation, refreshAll } = useBoardRows()

let refreshInterval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  refreshAll()
  refreshInterval = setInterval(refreshAll, 60_000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})

function handleExpired(entryId: string) {
  refreshStation(entryId)
}
</script>

<template>
  <div class="board-screen">
    <DepartureBoard :rows="boardRows" @expired="handleExpired" />
  </div>
</template>

<style scoped>
.board-screen {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  background-color: var(--board-bg);
  color: var(--board-fg);
}
</style>
