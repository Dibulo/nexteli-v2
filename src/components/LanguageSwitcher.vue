<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import type { LocaleId } from '@/types/itinerary'

const { locale } = useI18n()
const settings = useSettingsStore()

const languages: { id: LocaleId; label: string }[] = [
  { id: 'de', label: 'Deutsch' },
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
  <select
    class="select select-bordered w-full max-w-xs"
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
</template>
