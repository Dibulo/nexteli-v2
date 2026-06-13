<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import StationSearch from '@/components/StationSearch.vue'
import { useItineraries } from '@/composables/useItineraries'
import type { SavedStation } from '@/types/itinerary'

const { t } = useI18n()
const router = useRouter()
const { hasRoutes, addRoute } = useItineraries()

const departure = ref<SavedStation | null>(null)
const destination = ref<SavedStation | null>(null)
const errorMsg = ref<string | null>(null)

const canSubmit = computed(
  () => departure.value !== null && destination.value !== null
)

function handleSubmit() {
  if (!departure.value || !destination.value) return

  if (departure.value.id === destination.value.id) {
    errorMsg.value = t('route.sameStation')
    return
  }

  const added = addRoute(departure.value, destination.value)
  if (!added) {
    errorMsg.value = t('route.duplicate')
    return
  }

  router.push('/routes')
}
</script>

<template>
  <div class="page-container">
    <!-- About section -->
    <div
      v-motion-fade
      :class="[
        'surface-muted mb-8',
        hasRoutes ? 'p-5' : 'p-6',
      ]"
    >
      <div class="flex items-start gap-4">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Info class="size-5" />
        </span>
        <div>
          <h1 class="page-title">{{ t('about.title') }}</h1>
          <p class="mt-2 text-sm leading-relaxed opacity-75">
            {{ t('about.description') }}
          </p>
          <p class="mt-2 text-xs opacity-50">{{ t('about.privacy') }}</p>
        </div>
      </div>
    </div>

    <!-- Route form -->
    <div class="surface-card p-6 sm:p-8">
      <h2 class="text-lg font-semibold tracking-tight">{{ t('nav.addRoute') }}</h2>
      <p class="mt-1 text-sm opacity-60">
        {{ t('route.departure') }} → {{ t('route.destination') }}
      </p>

      <div class="mt-6 flex flex-col gap-5">
        <StationSearch
          v-model="departure"
          :label="t('route.departure')"
          :placeholder="t('route.departure')"
        />
        <StationSearch
          v-model="destination"
          :label="t('route.destination')"
          :placeholder="t('route.destination')"
        />

        <div v-if="errorMsg" class="alert alert-warning text-sm">
          {{ errorMsg }}
        </div>

        <button
          class="btn btn-primary mt-1 w-full rounded-xl"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ t('route.submit') }}
        </button>
      </div>
    </div>

    <div v-if="hasRoutes" class="mt-6 text-center">
      <router-link
        to="/routes"
        class="link link-primary text-sm font-medium opacity-80 hover:opacity-100"
      >
        {{ t('nav.back') }}
      </router-link>
    </div>
  </div>
</template>
