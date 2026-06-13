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
  <div
    class="inline-flex rounded-xl border border-base-300/50 bg-base-200/60 p-1"
    role="group"
    :aria-label="t('settings.theme')"
  >
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
      :class="
        !isDark
          ? 'bg-base-100 text-warning shadow-sm'
          : 'text-base-content/50 hover:text-base-content/70'
      "
      :aria-label="t('settings.themeLight')"
      :aria-pressed="!isDark"
      @click="setLight"
    >
      <Sun class="size-4" />
      <span class="hidden sm:inline">{{ t('settings.themeLight') }}</span>
    </button>
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
      :class="
        isDark
          ? 'bg-base-100 text-primary shadow-sm'
          : 'text-base-content/50 hover:text-base-content/70'
      "
      :aria-label="t('settings.themeDark')"
      :aria-pressed="isDark"
      @click="setDark"
    >
      <Moon class="size-4" />
      <span class="hidden sm:inline">{{ t('settings.themeDark') }}</span>
    </button>
  </div>
</template>
