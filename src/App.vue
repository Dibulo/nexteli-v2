<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const isBoardScreen = computed(() => route.name === 'stations')
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--board': isBoardScreen }">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  flex-direction: column;
}

.app-shell--board {
  background-color: var(--board-bg);
  color: var(--board-fg);
}

.app-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.app-shell:not(.app-shell--board) .app-main {
  padding-bottom: 2rem;
}
</style>
