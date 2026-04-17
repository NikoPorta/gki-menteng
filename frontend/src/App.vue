<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <div class="col-auto">
        <Sidebar :class="{ 'show': sidebarOpen }" @click="sidebarOpen = false" />
      </div>
      <div class="col">
        <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />
        <main>
          <router-view />
        </main>
      </div>
    </div>
    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const sidebarOpen = ref(false)
</script>

<style>
.container-fluid {
  padding: 0;
  overflow: hidden;
}

.sidebar {
  transition: transform 0.3s ease;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (max-width: 991.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
}
</style>