<template>
  <aside class="sidebar p-4">
    <div class="sidebar-brand text-center">
      <i class="bi bi-church cross-icon sidebar-brand-icon"></i>
      <h3 class="mt-3 gold-text mb-1">GKI Menteng</h3>
      <p class="small text-muted mb-0">Est. 1965</p>
    </div>

    <nav class="nav flex-column sidebar-nav">
      <router-link to="/" class="nav-link mb-2" @click="emit('navigate')">
        <i class="bi bi-grid-1x2-fill me-2"></i>
        <span class="nav-text">Dashboard</span>
      </router-link>
      <router-link to="/members" class="nav-link mb-2" @click="emit('navigate')">
        <i class="bi bi-people-fill me-2"></i>
        <span class="nav-text">Church Members</span>
      </router-link>
      <router-link to="/events" class="nav-link mb-2" @click="emit('navigate')">
        <i class="bi bi-calendar-event-fill me-2"></i>
        <span class="nav-text">Events</span>
      </router-link>
      <router-link to="/volunteers" class="nav-link mb-2" @click="emit('navigate')">
        <i class="bi bi-mic-fill me-2"></i>
        <span class="nav-text">Volunteers</span>
      </router-link>
      <router-link v-if="canManageBible" to="/bible" class="nav-link mb-2" @click="emit('navigate')">
        <i class="bi bi-book-fill me-2"></i>
        <span class="nav-text">Bible Library</span>
      </router-link>
      <router-link to="/bible-preview" class="nav-link mb-2" @click="emit('navigate')">
        <i class="bi bi-journal-bookmark-fill me-2"></i>
        <span class="nav-text">Bible Preview</span>
      </router-link>
      <!-- <router-link to="/donations" class="nav-link mb-2">
        <i class="bi bi-gift-fill me-2"></i>
        <span class="nav-text">Donations</span>
      </router-link> -->
      <!-- <router-link to="/reports" class="nav-link mb-2">
        <i class="bi bi-graph-up me-2"></i>
        <span class="nav-text">Reports</span>
      </router-link> -->
    </nav>

    <div class="sidebar-footer">
      <div class="text-center">
        <i class="bi bi-crosshair sidebar-footer-icon"></i>
        <p class="small text-muted mt-2 mb-1">"Faith without works is dead"</p>
        <p class="small text-muted mb-0">James 2:26</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const emit = defineEmits<{
  navigate: []
}>()

const canManageBible = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  padding: 1.5rem;
}

.sidebar-brand,
.sidebar-footer,
.sidebar-nav {
  position: relative;
  z-index: 1;
}

.sidebar-brand {
  padding-bottom: 0.75rem;
}

.sidebar-brand-icon {
  font-size: 3rem;
}

.sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 175, 55, 0.16);
}

.sidebar-footer-icon {
  color: #d4af37;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.28);
  border-radius: 999px;
}

@media (max-width: 991.98px) {
  .sidebar {
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .sidebar-brand {
    text-align: left !important;
  }

  .sidebar-brand-icon {
    font-size: 2.5rem;
  }

  .sidebar-footer {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }

  .nav-text {
    display: inline;
  }
}

@media (max-width: 575.98px) {
  .sidebar {
    padding: 1rem;
  }
}
</style>
