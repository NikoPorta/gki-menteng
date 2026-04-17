<template>
  <div class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Church Events</h2>
      <button class="luxury-btn" data-bs-toggle="modal" data-bs-target="#addEventModal">
        <i class="bi bi-calendar-plus-fill me-2"></i>Schedule Event
      </button>
    </div>
    
    <div class="row">
      <div class="col-md-6 mb-4" v-for="event in churchStore.events" :key="event.id">
        <div class="church-card p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 class="mb-1">{{ event.title }}</h4>
              <p class="text-muted mb-0">{{ event.location }}</p>
            </div>
            <i class="bi bi-calendar-check gold-text fs-2"></i>
          </div>
          <div class="mb-3">
            <p><i class="bi bi-calendar-date me-2"></i>{{ formatDate(event.date) }}</p>
            <p><i class="bi bi-clock me-2"></i>{{ event.time }}</p>
            <p><i class="bi bi-people me-2"></i>{{ event.attendees }} attendees registered</p>
          </div>
          <p class="mb-0">{{ event.description }}</p>
          <hr>
          <button class="btn btn-outline-gold w-100">Register for Event</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChurchStore } from '../stores/church'

const churchStore = useChurchStore()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
</script>