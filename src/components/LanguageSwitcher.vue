<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Globe } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import type { LocaleId } from '@/types/itinerary'

const { locale } = useI18n()
const settings = useSettingsStore()

const languages: { id: LocaleId; label: string }[] = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'it', label: 'Italiano' },
  { id: 'gsw', label: 'Schwiizerdütsch' },
]

function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as LocaleId
  settings.setLocale(value)
  locale.value = value
}
</script>

<template>
  <div class="relative">
    <Globe
      class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-base-content/55"
    />
    <select
      class="select select-bordered h-12 w-full max-w-sm rounded-xl pl-10 transition-shadow focus:shadow-sm"
      :value="settings.locale"
      @change="onChange"
    >
      <option
        v-for="lang in languages"
        :key="lang.id"
        :value="lang.id"
      >
        {{ lang.label }}
      </option>
    </select>
  </div>
</template>
