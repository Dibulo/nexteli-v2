<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sun, Moon } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

const isDark = computed(() => settings.theme === 'nexteli-dark')

function toggle() {
  settings.setTheme(isDark.value ? 'nexteli' : 'nexteli-dark')
}
</script>

<template>
  <div class="flex items-center gap-3">
    <Sun class="size-5" :class="isDark ? 'opacity-40' : 'text-warning'" />
    <input
      type="checkbox"
      class="toggle toggle-primary"
      :checked="isDark"
      :aria-label="isDark ? t('settings.themeLight') : t('settings.themeDark')"
      @change="toggle"
    />
    <Moon class="size-5" :class="isDark ? 'text-primary' : 'opacity-40'" />
  </div>
</template>
