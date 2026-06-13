<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sun, Moon } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

const isDark = computed(() => settings.theme === 'nexteli-dark')

function setLight() {
  settings.setTheme('nexteli')
}

function setDark() {
  settings.setTheme('nexteli-dark')
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      class="btn btn-ghost btn-sm btn-square"
      :class="!isDark ? 'text-warning' : 'opacity-40'"
      :aria-label="t('settings.themeLight')"
      :aria-pressed="!isDark"
      @click="setLight"
    >
      <Sun class="size-5" />
    </button>
    <button
      type="button"
      class="btn btn-ghost btn-sm btn-square"
      :class="isDark ? 'text-primary' : 'opacity-40'"
      :aria-label="t('settings.themeDark')"
      :aria-pressed="isDark"
      @click="setDark"
    >
      <Moon class="size-5" />
    </button>
  </div>
</template>
