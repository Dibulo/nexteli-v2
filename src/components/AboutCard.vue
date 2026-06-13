<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Info, ExternalLink } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div class="surface-card p-5 sm:p-6">
    <div class="flex items-start gap-4">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      >
        <Info class="size-5" />
      </span>
      <div>
        <h2 class="text-base font-semibold tracking-tight">{{ t('about.title') }}</h2>
        <p class="mt-2 text-sm leading-relaxed opacity-75">
          {{ t('about.description') }}
        </p>
        <p class="mt-2 text-xs opacity-50">{{ t('about.privacy') }}</p>
      </div>
    </div>
  </div>
</template>
