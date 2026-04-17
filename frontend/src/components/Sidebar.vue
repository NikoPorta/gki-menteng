<template>
  <div class="sidebar p-4">
    <div class="text-center mb-5">
      <i class="bi bi-church cross-icon" style="font-size: 3rem;"></i>
      <h3 class="mt-3 gold-text">GKI Menteng</h3>
      <p class="small text-muted">Est. 1965</p>
    </div>
    
    <nav class="nav flex-column">
      <router-link to="/" class="nav-link mb-2">
        <i class="bi bi-grid-1x2-fill me-2"></i>
        <span class="nav-text">Dashboard</span>
      </router-link>
      <router-link to="/members" class="nav-link mb-2">
        <i class="bi bi-people-fill me-2"></i>
        <span class="nav-text">Church Members</span>
      </router-link>
      <router-link to="/events" class="nav-link mb-2">
        <i class="bi bi-calendar-event-fill me-2"></i>
        <span class="nav-text">Events</span>
      </router-link>
      <router-link to="/volunteers" class="nav-link mb-2">
        <i class="bi bi-mic-fill me-2"></i>
        <span class="nav-text">Volunteers</span>
      </router-link>
      <router-link to="/donations" class="nav-link mb-2">
        <i class="bi bi-gift-fill me-2"></i>
        <span class="nav-text">Donations</span>
      </router-link>
      <router-link to="/reports" class="nav-link mb-2">
        <i class="bi bi-graph-up me-2"></i>
        <span class="nav-text">Reports</span>
      </router-link>
    </nav>
    
    <div class="mt-auto pt-5">
      <div class="text-center">
        <i class="bi bi-crosshair" style="color: #d4af37;"></i>
        <p class="small text-muted mt-2">"Faith without works is dead"</p>
        <p class="small text-muted">James 2:26</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
@media (max-width: 991.98px) {
  .nav-text {
    display: inline;
  }
}
</style>
