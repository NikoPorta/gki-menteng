import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Members from '../views/Members.vue'
import Events from '../views/Events.vue'
import Donations from '../views/Donations.vue'
import Reports from '../views/Reports.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    }
  ]
})

export default router