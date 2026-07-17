import { createRouter, createWebHistory } from 'vue-router'
import { useStationsStore } from '@/stores/stations'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/stations',
    },
    {
      path: '/stations',
      name: 'stations',
      component: () => import('@/pages/StationsPage.vue'),
    },
    {
      path: '/station/new',
      name: 'station-new',
      component: () => import('@/pages/NewStationPage.vue'),
    },
    {
      path: '/stations/edit/:id',
      name: 'station-edit',
      component: () => import('@/pages/EditStationPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const store = useStationsStore()

  if (to.path === '/' || to.name === 'home') {
    return store.hasStations ? '/stations' : '/station/new'
  }

  if (to.name === 'stations' && !store.hasStations) {
    return '/station/new'
  }
})

export default router
