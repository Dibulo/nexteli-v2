<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ExternalLink, Trash2 } from 'lucide-vue-next'
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
  <div class="mx-auto max-w-2xl px-4 py-6">
    <h1 class="mb-6 text-2xl font-bold">{{ t('settings.title') }}</h1>

    <div class="flex flex-col gap-4">
      <!-- About -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title text-lg">{{ t('settings.about') }}</h2>
          <p class="text-sm opacity-80">{{ t('about.description') }}</p>
          <p class="mt-1 text-xs opacity-60">{{ t('about.privacy') }}</p>
          <a
            href="https://transport.opendata.ch"
            target="_blank"
            rel="noopener"
            class="link link-primary mt-2 inline-flex items-center gap-1 text-sm"
          >
            transport.opendata.ch
            <ExternalLink class="size-3" />
          </a>
        </div>
      </div>

      <!-- Language -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title text-lg">{{ t('settings.language') }}</h2>
          <LanguageSwitcher />
        </div>
      </div>

      <!-- Theme -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title text-lg">{{ t('settings.theme') }}</h2>
          <ThemeToggle />
        </div>
      </div>

      <!-- Install PWA -->
      <div v-if="showInstall" class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title text-lg">{{ t('settings.install') }}</h2>
          <button class="btn btn-primary btn-sm" @click="installPwa">
            {{ t('settings.installButton') }}
          </button>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="card border border-error bg-base-200">
        <div class="card-body">
          <h2 class="card-title text-lg text-error">
            {{ t('settings.dangerZone') }}
          </h2>
          <button
            class="btn btn-error btn-outline btn-sm mt-2"
            @click="handleClearAll"
          >
            <Trash2 class="size-4" />
            {{ t('settings.clearAll') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
