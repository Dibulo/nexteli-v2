<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Plus, Settings } from 'lucide-vue-next'
import { useStationsStore } from '@/stores/stations'

const { t } = useI18n()
const route = useRoute()
const store = useStationsStore()

const logoTarget = computed(() =>
  store.hasStations ? '/stations' : '/station/new'
)

const isBoardScreen = computed(() => route.name === 'stations')
</script>

<template>
  <header class="app-header" :class="{ 'app-header--board': isBoardScreen }">
    <router-link :to="logoTarget" class="app-header__brand">
      <img
        src="/icon.webp"
        alt=""
        width="36"
        height="36"
        class="app-header__logo"
      />
      <span class="app-header__title">Nexteli</span>
    </router-link>

    <div class="app-header__actions">
      <router-link
        v-if="store.hasStations"
        to="/station/new"
        class="app-header__action"
        :aria-label="t('nav.addStation')"
      >
        <Plus class="app-header__icon" />
        <span class="app-header__action-label">{{ t('nav.addStation') }}</span>
      </router-link>

      <router-link
        to="/settings"
        class="app-header__action app-header__action--icon"
        :aria-label="t('nav.settings')"
      >
        <Settings class="app-header__icon" />
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid
    color-mix(in oklch, var(--color-base-content) 10%, transparent);
  background-color: color-mix(in oklch, var(--color-base-100) 88%, transparent);
  backdrop-filter: blur(10px);
  z-index: 30;
}

@media (min-width: 640px) {
  .app-header {
    padding: 0.85rem 1.5rem;
  }
}

.app-header--board {
  flex-shrink: 0;
  border-bottom-color: color-mix(in oklch, var(--board-fg) 14%, transparent);
  background-color: var(--board-bg);
  backdrop-filter: none;
  color: var(--board-fg);
}

.app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

.app-header__logo {
  width: 2rem;
  height: 2rem;
  border-radius: 0.35rem;
  flex-shrink: 0;
}

.app-header--board .app-header__logo {
  width: 2.25rem;
  height: 2.25rem;
}

.app-header__title {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-base-content);
}

.app-header--board .app-header__title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--board-fg);
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: auto;
}

.app-header__action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.35rem;
  color: inherit;
  text-decoration: none;
  opacity: 0.75;
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease;
}

.app-header__action:hover,
.app-header__action:focus-visible {
  opacity: 1;
  background-color: color-mix(in oklch, currentColor 8%, transparent);
  outline: none;
}

.app-header--board .app-header__action {
  font-family: var(--font-display);
  letter-spacing: 0.04em;
  color: var(--board-fg);
}

.app-header__action--icon {
  padding-inline: 0.55rem;
}

.app-header__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.app-header__action-label {
  display: none;
  font-size: 0.95rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .app-header__action-label {
    display: inline;
  }
}
</style>
