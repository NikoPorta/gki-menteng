import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Dashboard from '../views/Dashboard.vue'
import Members from '../views/Members.vue'
import Events from '../views/Events.vue'
import Donations from '../views/Donations.vue'
import Reports from '../views/Reports.vue'
import Auth from '../views/Auth.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Auth,
      meta: { guest: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/members',
      name: 'members',
      component: Members,
      meta: { requiresAuth: true }
    },
    {
      path: '/events',
      name: 'events',
      component: Events,
      meta: { requiresAuth: true }
    },
    {
      path: '/donations',
      name: 'donations',
      component: Donations,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initAuth()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router