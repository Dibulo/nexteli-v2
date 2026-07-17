<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Settings } from 'lucide-vue-next'
import { useStationsStore } from '@/stores/stations'

const { t } = useI18n()
const store = useStationsStore()

const logoTarget = computed(() =>
  store.hasStations ? '/stations' : '/station/new'
)
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-base-300/40 bg-base-100/70 backdrop-blur-md"
  >
    <div class="mx-auto flex w-full  items-center px-4 py-3 sm:px-6">
      <div class="flex-1">
        <router-link
          :to="logoTarget"
          class="inline-flex items-center gap-2.5 rounded-xl px-1 py-1 transition-colors hover:bg-base-200/60"
        >
          <img
            src="/icon.webp"
            alt=""
            width="36"
            height="36"
            class="size-9 rounded-xl"
          />
          <span class="text-xl font-bold tracking-tight text-base-content">
            Nexteli
          </span>
        </router-link>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          v-if="store.hasStations"
          to="/station/new"
          class="btn btn-primary btn-sm gap-1.5 rounded-full px-4"
        >
          <Plus class="size-4" />
          <span class="hidden sm:inline">{{ t('nav.addStation') }}</span>
        </router-link>

        <router-link
          to="/settings"
          class="btn btn-ghost btn-sm btn-circle"
          :aria-label="t('nav.settings')"
        >
          <Settings class="size-5" />
        </router-link>
      </div>
    </div>
  </header>
</template>
