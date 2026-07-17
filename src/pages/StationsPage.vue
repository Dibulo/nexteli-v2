<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { VueDraggable } from 'vue-draggable-plus'
import StationCard from '@/components/StationCard.vue'
import { useStations } from '@/composables/useStations'

const { t } = useI18n()
const router = useRouter()
const {
  stationEntries,
  savedStations,
  hasStations,
  removeStation,
  refreshAll,
  setStationOrder,
} = useStations()

let refreshInterval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  refreshAll()
  refreshInterval = setInterval(refreshAll, 60_000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})

function handleRemove(id: string) {
  removeStation(id)
  if (!hasStations.value) {
    router.push('/station/new')
  }
}
</script>

<template>
  <div class="page-container">
    <div class="mb-8">
      <h1 class="page-title">{{ t('stations.title') }}</h1>
    </div>
    <VueDraggable
      :model-value="savedStations"
      item-key="id"
      handle=".station-drag-handle"
      :animation="200"
      direction="vertical"
      ghost-class="route-card-ghost"
      class="flex flex-col gap-5"
      @update:model-value="setStationOrder"
    >
      <div v-for="entry in stationEntries" :key="entry.id">
        <StationCard :entry="entry" @remove="handleRemove" />
      </div>
    </VueDraggable>
  </div>
</template>
