<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="handleOverlayClick">
      <div
        class="modal-container modal-top"
        :style="{ width: modalWidth }"
      >
        <div class="modal-header">
          <div class="modal-header-left">
            <p class="modal-caption">Selected Date</p>
            <h3 class="modal-title">{{ selectedDateLabel }}</h3>
          </div>
          <button
            type="button"
            class="modal-close"
            aria-label="Close modal"
            @click="closeModal"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="event-count-row mb-4">
            <span class="event-counter">{{ events.length }} event{{ events.length === 1 ? '' : 's' }}</span>
          </div>

          <div v-if="events.length" class="events-list">
            <div
              v-for="event in events"
              :key="event.id"
              class="event-card"
            >
              <div class="event-card-header">
                <div>
                  <h5 class="event-title">{{ event.title }}</h5>
                  <p class="event-location">{{ event.location }}</p>
                </div>
                <i class="bi bi-calendar-check gold-text fs-4"></i>
              </div>
              <div class="event-meta">
                <p><i class="bi bi-calendar-date me-2"></i>{{ event.date }}</p>
                <p><i class="bi bi-clock me-2"></i>{{ event.time }}</p>
              </div>
              <div v-if="event.volunteers" class="volunteer-display">
                <p class="mb-1"><i class="bi bi-people me-2"></i>Volunteers:</p>
                <ul class="volunteer-list mb-0">
                  <li v-for="vol in event.volunteers.split('; ').filter(Boolean)" :key="vol">
                    {{ vol.replace(': ', ': ') }}
                  </li>
                </ul>
              </div>
              <p class="event-description">{{ event.description }}</p>
              <div v-if="canManageEvents" class="action-buttons">
                <button class="btn btn-outline-gold flex-fill" @click="$emit('edit', event)">
                  Edit
                </button>
                <button class="btn btn-outline-danger flex-fill" @click="$emit('delete', event.id)">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="bi bi-calendar-x fs-2 mb-3"></i>
            <p class="mb-0">No events scheduled for this date.</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Event } from '@/stores/church'

interface Props {
  modelValue: boolean
  selectedDateLabel: string
  events: Event[]
  canManageEvents: boolean
  modalWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  modalWidth: '900px'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  edit: [event: Event]
  delete: [eventId: string]
}>()

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  padding-top: 2rem;
  z-index: 1055;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: linear-gradient(180deg, var(--theme-surface-strong), var(--theme-surface));
  border: 1px solid var(--theme-border);
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  animation: slideDown 0.3s var(--motion-ease);
}

.modal-top {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  max-width: calc(100vw - 2rem);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-header-left {
  flex: 1;
}

.modal-caption {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.78rem;
  color: #d4af37;
  margin-bottom: 0.5rem;
}

.modal-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--theme-text);
}

.modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  background: transparent;
  color: var(--theme-text);
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  border-color: rgba(212, 175, 55, 0.5);
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.event-count-row {
  border-bottom: 1px solid var(--theme-border);
  padding-bottom: 1rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.event-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 20px;
  padding: 1.25rem;
  color: var(--theme-text);
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.event-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--theme-text);
}

.event-location {
  color: var(--theme-muted);
  margin: 0;
  font-size: 0.9rem;
}

.event-meta {
  margin-bottom: 1rem;
}

.event-meta p {
  margin-bottom: 0.5rem;
  color: var(--theme-text);
}

.volunteer-display {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.volunteer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.volunteer-list li {
  padding: 0.2rem 0;
  font-size: 0.9rem;
  color: var(--theme-text);
}

.event-description {
  margin-bottom: 1.25rem;
  line-height: 1.6;
  color: var(--theme-text);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-buttons .btn {
  border-radius: 12px;
  padding: 0.6rem 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  min-height: 200px;
  border: 1px dashed var(--theme-border);
  border-radius: 20px;
  color: var(--theme-muted);
  background: var(--theme-surface);
}

.gold-text {
  color: #d4af37;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .modal-top {
    width: calc(100vw - 2rem);
    max-width: 600px;
  }
}

@media (max-width: 767.98px) {
  .modal-overlay {
    padding-top: 1rem;
  }

  .modal-header {
    padding: 1rem 1rem 0 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
