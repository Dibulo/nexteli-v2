<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Settings, TrainFront } from 'lucide-vue-next'
import { useItinerariesStore } from '@/stores/itineraries'

const { t } = useI18n()
const store = useItinerariesStore()

const logoTarget = computed(() =>
  store.hasRoutes ? '/routes' : '/route/new'
)
</script>

<template>
  <header class="navbar bg-base-100 shadow-sm">
    <div class="mx-auto flex w-full max-w-2xl items-center px-2">
      <div class="flex-1">
        <router-link
          :to="logoTarget"
          class="btn btn-ghost gap-2 text-xl font-bold text-primary"
        >
          <TrainFront class="size-6" />
          Nexteli
        </router-link>
      </div>

      <div class="flex items-center gap-1">
        <router-link
          v-if="store.hasRoutes"
          to="/route/new"
          class="btn btn-primary btn-sm gap-1"
        >
          <Plus class="size-4" />
          <span class="hidden sm:inline">{{ t('nav.addRoute') }}</span>
        </router-link>

        <router-link
          to="/settings"
          class="btn btn-ghost btn-sm"
          :aria-label="t('nav.settings')"
        >
          <Settings class="size-5" />
        </router-link>
      </div>
    </div>
  </header>
</template>
