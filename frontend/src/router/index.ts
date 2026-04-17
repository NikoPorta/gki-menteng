import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Dashboard from '../views/Dashboard.vue'
import Members from '../views/Members.vue'
import Events from '../views/Events.vue'
import Donations from '../views/Donations.vue'
import Reports from '../views/Reports.vue'
import Auth from '../views/Auth.vue'
import Volunteers from '../views/Volunteers.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Auth
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/members',
      name: 'members',
      component: Members
    },
    {
      path: '/events',
      name: 'events',
      component: Events
    },
    {
      path: '/donations',
      name: 'donations',
      component: Donations
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports
    },
    {
      path: '/volunteers',
      name: 'volunteers',
      component: Volunteers
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initAuth()

  next()
})

export default router
