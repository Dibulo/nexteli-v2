import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LocaleId, ThemeId } from '@/types/itinerary'
import { loadSettings, saveSettings, clearAllData } from '@/utils/storage'
import { getBrowserLocale } from '@/utils/locale'
import { useStationsStore } from '@/stores/stations'

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<LocaleId>(getBrowserLocale())
  const theme = ref<ThemeId>('nexteli')

  function hydrate() {
    const saved = loadSettings()
    locale.value = saved.locale
    theme.value = saved.theme
  }

  function setLocale(newLocale: LocaleId) {
    locale.value = newLocale
    document.documentElement.lang = newLocale
    persist()
  }

  function setTheme(newTheme: ThemeId) {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    persist()
  }

  function persist() {
    saveSettings({ locale: locale.value, theme: theme.value })
  }

  function clearAllData_() {
    const stationsStore = useStationsStore()
    stationsStore.clearAll()
    clearAllData()
    const browserLocale = getBrowserLocale()
    locale.value = browserLocale
    theme.value = 'nexteli'
    document.documentElement.lang = browserLocale
    document.documentElement.setAttribute('data-theme', 'nexteli')
  }

  return {
    locale,
    theme,
    hydrate,
    setLocale,
    setTheme,
    clearAllData: clearAllData_,
  }
})
