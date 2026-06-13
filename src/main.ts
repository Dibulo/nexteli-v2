import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'
import { useSettingsStore } from './stores/settings'
import { useItinerariesStore } from './stores/itineraries'

import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import gsw from './locales/gsw.json'

import { getBrowserLocale } from './utils/locale'

import './app.css'

const pinia = createPinia()

const i18n = createI18n({
  legacy: false,
  locale: getBrowserLocale(),
  fallbackLocale: 'en',
  messages: { de, en, fr, it, gsw },
})

const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.use(router)
app.use(MotionPlugin)

const settings = useSettingsStore()
settings.hydrate()
document.documentElement.setAttribute('data-theme', settings.theme)
document.documentElement.lang = settings.locale
i18n.global.locale.value = settings.locale

const itineraries = useItinerariesStore()
itineraries.hydrate()

app.mount('#app')
