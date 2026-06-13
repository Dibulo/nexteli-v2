import { createRouter, createWebHistory } from 'vue-router'
import { useItinerariesStore } from '@/stores/itineraries'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/routes',
    },
    {
      path: '/routes',
      name: 'routes',
      component: () => import('@/pages/RoutesPage.vue'),
    },
    {
      path: '/route/new',
      name: 'route-new',
      component: () => import('@/pages/NewRoutePage.vue'),
    },
    {
      path: '/routes/edit/:id',
      name: 'route-edit',
      component: () => import('@/pages/EditRoutePage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const store = useItinerariesStore()

  if (to.path === '/' || to.name === 'home') {
    return store.hasRoutes ? '/routes' : '/route/new'
  }

  if (to.name === 'routes' && !store.hasRoutes) {
    return '/route/new'
  }
})

export default router
