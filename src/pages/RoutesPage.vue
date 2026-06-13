<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RouteCard from '@/components/RouteCard.vue'
import { useItineraries } from '@/composables/useItineraries'

const { t } = useI18n()
const router = useRouter()
const { routes, hasRoutes, removeRoute, refreshAll } = useItineraries()

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
  <div class="mx-auto max-w-2xl px-4 py-6">
    <h1 class="mb-4 text-2xl font-bold">{{ t('routes.title') }}</h1>
    <div class="flex flex-col gap-4">
      <RouteCard
        v-for="route in routes"
        :key="route.id"
        :route="route"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>
