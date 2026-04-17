<template>
  <header class="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center">
      <button
        v-if="authStore.isAuthenticated"
        class="btn btn-link d-lg-none me-3 p-0"
        type="button"
        @click="$emit('toggle-sidebar')"
      >
        <i class="bi bi-list fs-4 text-dark"></i>
      </button>
      <div>
        <h4 class="mb-0 d-none d-md-block">
          <i class="bi bi-church me-2 gold-text"></i>
          Church Management Dashboard
        </h4>
        <h5 class="mb-0 d-md-none">
          <i class="bi bi-church me-2 gold-text"></i>
          GKI Menteng
        </h5>
        <small class="text-muted d-none d-sm-block">Luxury Edition</small>
      </div>
    </div>
    
    <div class="d-flex align-items-center">
      <div class="me-4 d-none d-sm-block">
        <i class="bi bi-bell gold-text fs-5"></i>
      </div>
      <div v-if="authStore.isAuthenticated" class="dropdown">
        <button class="btn btn-link dropdown-toggle text-dark" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle fs-4"></i>
          <span class="ms-2 d-none d-sm-inline">{{ authStore.currentUser?.name || 'User' }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
          <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
        </ul>
      </div>
      <router-link v-else to="/login" class="btn luxury-btn">
        <i class="bi bi-box-arrow-in-right me-2"></i>
        Login
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

defineEmits(['toggle-sidebar'])

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
