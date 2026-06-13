<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Trash2, ExternalLink } from 'lucide-vue-next'
import AboutCard from '@/components/AboutCard.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const router = useRouter()
const settings = useSettingsStore()
const showInstall = ref(false)
let deferredPrompt: Event | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstall.value = true
  })
}

async function installPwa() {
  if (!deferredPrompt) return
  ;(deferredPrompt as any).prompt()
  const result = await (deferredPrompt as any).userChoice
  if (result.outcome === 'accepted') {
    showInstall.value = false
  }
  deferredPrompt = null
}

function handleClearAll() {
  if (!confirm(t('settings.clearAllConfirm'))) return
  settings.clearAllData()
  router.push('/route/new')
}
</script>

<template>
  <div class="page-container">
    <div class="mb-8">
      <h1 class="page-title">{{ t('settings.title') }}</h1>
    </div>

    <div class="flex flex-col gap-5">
      <AboutCard />

      <!-- Language -->
      <div class="surface-card p-5 sm:p-6">
        <h2 class="text-base font-semibold tracking-tight">{{ t('settings.language') }}</h2>
        <div class="mt-4">
          <LanguageSwitcher />
        </div>
      </div>

      <!-- Theme -->
      <div class="surface-card p-5 sm:p-6">
        <h2 class="text-base font-semibold tracking-tight">{{ t('settings.theme') }}</h2>
        <div class="mt-4">
          <ThemeToggle />
        </div>
      </div>

      <!-- Install PWA -->
      <div v-if="showInstall" class="surface-card p-5 sm:p-6">
        <h2 class="text-base font-semibold tracking-tight">{{ t('settings.install') }}</h2>
        <button
          class="btn btn-primary btn-sm mt-4 rounded-full px-5"
          @click="installPwa"
        >
          {{ t('settings.installButton') }}
        </button>
      </div>

      <!-- Danger zone -->
      <div
        class="rounded-2xl border border-error/30 bg-error/5 p-5 sm:p-6"
      >
        <h2 class="text-base font-semibold tracking-tight text-error">
          {{ t('settings.dangerZone') }}
        </h2>
        <p class="mt-1 text-sm opacity-60">{{ t('settings.clearAllConfirm') }}</p>
        <button
          class="btn btn-error btn-outline btn-sm mt-4 rounded-xl"
          @click="handleClearAll"
        >
          <Trash2 class="size-4" />
          {{ t('settings.clearAll') }}
        </button>
      </div>
    </div>

    <div class="mt-4 text-center text-sm opacity-50">
      Swiss public transportation data provided by:
      <a href="https://transport.opendata.ch" target="_blank" rel="noopener" class="link link-primary inline-flex items-center gap-1.5 text-sm font-medium">
        transport.opendata.ch
        <ExternalLink class="size-3.5" />
      </a>
    </div>

    <p class="mt-10 text-center text-xs opacity-50">
      Made in Switzerland by
      <a
        href="https://dibulo.com?ref=nexteli"
        target="_blank"
        rel="noopener"
        class="link link-hover"
      >
        dibulo.com
      </a>
    </p>
  </div>
</template>
