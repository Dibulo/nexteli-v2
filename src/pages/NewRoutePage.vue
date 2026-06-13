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
  <div class="mx-auto max-w-2xl px-4 py-6">
    <!-- About section -->
    <div
      v-motion-fade
      :class="[
        'card bg-base-200 mb-6',
        hasRoutes ? 'p-4' : 'p-6',
      ]"
    >
      <div class="flex items-start gap-3">
        <Info class="mt-1 size-5 shrink-0 text-primary" />
        <div>
          <h1 class="text-xl font-bold">{{ t('about.title') }}</h1>
          <p class="mt-1 text-sm opacity-80">{{ t('about.description') }}</p>
          <p class="mt-2 text-xs opacity-60">{{ t('about.privacy') }}</p>
        </div>
      </div>
    </div>

    <!-- Route form -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-lg">{{ t('nav.addRoute') }}</h2>

        <div class="mt-4 flex flex-col gap-4">
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
            class="btn btn-primary w-full"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            {{ t('route.submit') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="hasRoutes" class="mt-4 text-center">
      <router-link to="/routes" class="link link-primary text-sm">
        {{ t('nav.back') }}
      </router-link>
    </div>
  </div>
</template>
