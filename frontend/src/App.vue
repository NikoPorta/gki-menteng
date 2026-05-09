<template>
  <div class="app-wrapper">
    <template v-if="route.name === 'login'">
      <transition name="route-fade" mode="out-in" appear>
        <Auth key="login" />
      </transition>
    </template>
    <div v-else class="container-fluid p-0">
      <div class="app-shell">
        <div
          class="sidebar-column"
          :class="{
            'sidebar-column-mobile': !isDesktop,
            'is-open': !isDesktop && sidebarOpen
          }"
        >
          <Sidebar :class="{ 'show': sidebarOpen }" @navigate="sidebarOpen = false" />
        </div>
        <div class="app-content-column">
          <Header
            :theme="theme"
            @toggle-sidebar="sidebarOpen = !sidebarOpen"
            @toggle-theme="toggleTheme"
          />
          <main class="app-main">
            <router-view v-slot="{ Component, route: currentRoute }">
              <transition name="route-fade" mode="out-in" appear @after-enter="handleRouteEnter">
                <div :key="currentRoute.fullPath" class="route-stage">
                  <component :is="Component" />
                </div>
              </transition>
            </router-view>
          </main>
        </div>
      </div>
      <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Auth from '@/views/Auth.vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)
const isDesktop = ref(typeof window === 'undefined' ? true : window.matchMedia('(min-width: 992px)').matches)
const revealSelector = [
  '.route-stage > div',
  '.route-stage section',
  '.route-stage article',
  '.route-stage .church-card',
  '.route-stage .stat-card',
  '.route-stage .event-detail-card',
  '.route-stage .hero-stat',
  '.route-stage .volunteer-card',
  '.route-stage .verse-card',
  '.route-stage .page',
  '.route-stage .calendar-day',
  '.route-stage .table tbody tr',
  '.route-stage .alert',
  '.route-stage .summary-chip',
  '.route-stage .meta-chip'
].join(', ')

let revealObserver: IntersectionObserver | null = null
let mutationObserver: MutationObserver | null = null
let desktopMediaQuery: MediaQueryList | null = null
let handleViewportChange: ((event: MediaQueryListEvent) => void) | null = null

const syncSidebarViewport = (matches: boolean) => {
  isDesktop.value = matches

  if (matches) {
    sidebarOpen.value = false
    document.body.style.overflow = ''
  }
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    const savedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const theme = ref<'light' | 'dark'>(getInitialTheme())

const applyTheme = (mode: 'light' | 'dark') => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = mode
  document.documentElement.style.colorScheme = mode

  try {
    window.localStorage.setItem('theme', mode)
  } catch {
    // Ignore storage failures and keep the current session theme.
  }
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const revealElement = (element: HTMLElement) => {
  element.classList.add('is-visible')
  revealObserver?.unobserve(element)
}

const markAnimatedElements = (root?: ParentNode | null) => {
  if (typeof document === 'undefined') {
    return
  }

  const searchRoot = root ?? document
  const elements = Array.from(searchRoot.querySelectorAll<HTMLElement>(revealSelector))

  elements.forEach((element, index) => {
    if (
      element.closest('.sidebar')
      || element.closest('.app-header')
      || element.closest('.dropdown-menu')
    ) {
      return
    }

    if (element.dataset.motionReady === 'true') {
      return
    }

    element.dataset.motionReady = 'true'
    element.style.setProperty('--enter-delay', `${Math.min(index * 70, 560)}ms`)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.classList.add('is-visible')
      return
    }

    revealObserver?.observe(element)
  })
}

const handleRouteEnter = () => {
  markAnimatedElements(document.querySelector('.route-stage'))
}

watch(theme, applyTheme, { immediate: true })

watch(
  [sidebarOpen, isDesktop],
  ([open, desktop]) => {
    if (typeof document === 'undefined') {
      return
    }

    document.body.style.overflow = !desktop && open ? 'hidden' : ''
  },
  { immediate: true }
)

watch(
  () => route.fullPath,
  async () => {
    sidebarOpen.value = false
    await nextTick()
    handleRouteEnter()
  }
)

onMounted(() => {
  authStore.initAuth()
  desktopMediaQuery = window.matchMedia('(min-width: 992px)')
  syncSidebarViewport(desktopMediaQuery.matches)
  handleViewportChange = (event: MediaQueryListEvent) => {
    syncSidebarViewport(event.matches)
  }
  desktopMediaQuery.addEventListener('change', handleViewportChange)

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealElement(entry.target as HTMLElement)
      }
    })
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -12% 0px'
  })

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return
        }

        if (node.matches(revealSelector)) {
          markAnimatedElements(node.parentElement)
          return
        }

        markAnimatedElements(node)
      })
    })
  })

  mutationObserver.observe(document.body, { childList: true, subtree: true })
  nextTick(() => {
    handleRouteEnter()
  })
})

onBeforeUnmount(() => {
  if (desktopMediaQuery && handleViewportChange) {
    desktopMediaQuery.removeEventListener('change', handleViewportChange)
  }

  document.body.style.overflow = ''
  revealObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>

<style>
.app-wrapper {
  min-height: 100vh;
  position: relative;
  overflow-x: clip;
}

.app-wrapper::before,
.app-wrapper::after {
  content: '';
  position: fixed;
  inset: auto;
  width: 28rem;
  height: 28rem;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(28px);
  opacity: 0.22;
  z-index: 0;
}

.app-wrapper::before {
  top: -10rem;
  right: -8rem;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.35), transparent 68%);
}

.app-wrapper::after {
  bottom: -12rem;
  left: -8rem;
  background: radial-gradient(circle, rgba(255, 250, 243, 0.32), transparent 72%);
}

.container-fluid {
  position: relative;
  z-index: 1;
  padding: 0;
  overflow: visible;
}

.app-shell {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  width: 100%;
}

.sidebar-column {
  flex: 0 0 300px;
  max-width: 300px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  height: 100vh;
  z-index: 1001;
}

.app-content-column {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  margin-left: 300px;
}

.app-main {
  position: relative;
  min-height: calc(100vh - 88px);
}

.route-stage {
  position: relative;
  isolation: isolate;
}

.route-stage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  width: min(26rem, 40vw);
  height: 14rem;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.12), transparent 72%);
  filter: blur(10px);
  pointer-events: none;
  z-index: -1;
}

.sidebar {
  transition: transform 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
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

.route-fade-enter-active,
.route-fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.5s ease;
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.985);
  filter: blur(10px);
}

.route-fade-enter-to,
.route-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

@media (max-width: 991.98px) {
  .app-shell {
    display: block;
  }

  .sidebar-column {
    flex: 0 0 0;
    width: 0;
    max-width: 0;
    height: 100vh;
    overflow: visible;
  }

  .sidebar-column-mobile {
    pointer-events: none;
  }

  .sidebar-column-mobile.is-open {
    pointer-events: auto;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: clamp(280px, 78vw, 360px);
    max-width: calc(100vw - 1rem);
    transform: translateX(-100%);
    z-index: 1000;
    box-shadow: 18px 0 42px rgba(0, 0, 0, 0.22);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .app-content-column {
    margin-left: 0;
  }
}
</style>
