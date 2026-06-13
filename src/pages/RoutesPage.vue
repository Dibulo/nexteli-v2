<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { VueDraggable } from 'vue-draggable-plus'
import RouteCard from '@/components/RouteCard.vue'
import { useItineraries } from '@/composables/useItineraries'

const { t } = useI18n()
const router = useRouter()
const { routes, savedRoutes, hasRoutes, removeRoute, refreshAll, setRouteOrder } =
  useItineraries()

let refreshInterval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  refreshAll()
  refreshInterval = setInterval(refreshAll, 60_000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})

function handleRemove(id: string) {
  removeRoute(id)
  if (!hasRoutes.value) {
    router.push('/route/new')
  }
}
</script>

<template>
  <div class="page-container">
    <div class="mb-8">
      <h1 class="page-title">{{ t('routes.title') }}</h1>
    </div>
    <VueDraggable
      :model-value="savedRoutes"
      item-key="id"
      handle=".route-drag-handle"
      :animation="200"
      direction="vertical"
      ghost-class="route-card-ghost"
      class="flex flex-col gap-5"
      @update:model-value="setRouteOrder"
    >
      <div v-for="route in routes" :key="route.id">
        <RouteCard :route="route" @remove="handleRemove" />
      </div>
    </VueDraggable>
  </div>
</template>
