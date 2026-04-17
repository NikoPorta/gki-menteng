<template>
  <div class="events-view p-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h2 class="mb-0">Church Events</h2>
          <span class="source-badge">
            {{ environmentLabel }}
          </span>
        </div>
        <p class="text-muted mb-0">Manage the calendar from the app and store data in the right backend for each environment.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-gold" :disabled="churchStore.eventsLoading" @click="refreshEvents">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
        <button v-if="canManageEvents" class="luxury-btn" @click="openCreateForm">
          <i class="bi bi-calendar-plus-fill me-2"></i>Schedule Event
        </button>
      </div>
    </div>

    <div v-if="churchStore.eventsError" class="alert alert-danger mb-4">
      {{ churchStore.eventsError }}
    </div>

    <div class="row g-4">
      <div class="col-xl-8">
        <div class="church-card calendar-shell p-4">
          <div class="calendar-toolbar mb-4">
            <button class="btn btn-outline-gold" @click="goToPreviousMonth">
              <i class="bi bi-chevron-left me-2"></i>Previous
            </button>
            <div class="text-center">
              <p class="calendar-caption mb-1">Event Calendar</p>
              <h3 class="calendar-month mb-0">{{ monthLabel }}</h3>
            </div>
            <button class="btn btn-outline-gold" @click="goToNextMonth">
              Next<i class="bi bi-chevron-right ms-2"></i>
            </button>
          </div>

          <div v-if="churchStore.eventsLoading" class="empty-state">
            <i class="bi bi-hourglass-split fs-2 mb-3"></i>
            <p class="mb-0">Loading events...</p>
          </div>

          <template v-else>
            <div class="calendar-grid mb-4">
              <div
                v-for="dayName in weekdayLabels"
                :key="dayName"
                class="calendar-weekday"
              >
                {{ dayName }}
              </div>

              <button
                v-for="day in calendarDays"
                :key="day.key"
                type="button"
                class="calendar-day"
                :class="{
                  'is-outside-month': !day.isCurrentMonth,
                  'has-events': day.events.length > 0,
                  'is-selected': selectedDateKey === day.dateKey
                }"
                @click="selectDay(day.dateKey)"
              >
                <div class="calendar-day-header">
                  <span class="calendar-day-number">{{ day.dayNumber }}</span>
                  <span v-if="day.events.length" class="calendar-bubble">{{ day.events.length }}</span>
                </div>
                <div v-if="day.events.length" class="calendar-day-events">
                  <span
                    v-for="event in day.events.slice(0, 2)"
                    :key="event.id"
                    class="calendar-pill"
                  >
                    {{ event.time }} - {{ event.title }}
                  </span>
                  <span v-if="day.events.length > 2" class="calendar-more">
                    +{{ day.events.length - 2 }} more
                  </span>
                </div>
              </button>
            </div>

            <div class="selected-day-panel">
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                  <p class="calendar-caption mb-1">Selected Date</p>
                  <h4 class="mb-0">{{ selectedDateLabel }}</h4>
                </div>
                <span class="event-counter">{{ selectedDayEvents.length }} event{{ selectedDayEvents.length === 1 ? '' : 's' }}</span>
              </div>

              <div v-if="selectedDayEvents.length" class="row g-3">
                <div class="col-lg-6" v-for="event in selectedDayEvents" :key="event.id">
                  <div class="event-detail-card h-100">
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <h5 class="mb-1">{{ event.title }}</h5>
                        <p class="text-muted mb-0">{{ event.location }}</p>
                      </div>
                      <i class="bi bi-calendar-check gold-text fs-4"></i>
                    </div>
                    <div class="event-meta mb-3">
                      <p><i class="bi bi-calendar-date me-2"></i>{{ event.date }}</p>
                      <p><i class="bi bi-clock me-2"></i>{{ event.time }}</p>
                      <p><i class="bi bi-people me-2"></i>{{ event.attendees }} attendees registered</p>
                    </div>
                    <p class="mb-3">{{ event.description }}</p>
                    <div v-if="canManageEvents" class="d-flex gap-2">
                      <button class="btn btn-outline-gold flex-fill" @click="openEditForm(event)">
                        Edit
                      </button>
                      <button class="btn btn-outline-danger flex-fill" :disabled="submitting" @click="removeEvent(event.id)">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="empty-state">
                <i class="bi bi-calendar-x fs-2 mb-3"></i>
                <p class="mb-0">No events scheduled for this date.</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="col-xl-4">
        <div class="church-card editor-shell p-4">
          <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
            <div>
              <p class="calendar-caption mb-1">{{ canManageEvents ? 'Event Editor' : 'Guest Access' }}</p>
              <h4 class="mb-0">{{ canManageEvents ? (isEditing ? 'Edit Event' : 'Create Event') : 'View Only' }}</h4>
            </div>
            <button v-if="canManageEvents && showForm" class="btn btn-sm btn-outline-secondary" @click="closeForm">
              Close
            </button>
          </div>

          <div v-if="canManageEvents && showForm">
            <form class="event-form" @submit.prevent="submitForm">
              <div class="mb-3">
                <label class="form-label">Title</label>
                <input v-model="form.title" type="text" class="form-control" required>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Date</label>
                  <input v-model="form.date" type="date" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Time</label>
                  <input v-model="form.time" type="text" class="form-control" placeholder="10:00 AM" required>
                </div>
              </div>

              <div class="mb-3 mt-3">
                <label class="form-label">Location</label>
                <input v-model="form.location" type="text" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Attendees</label>
                <input v-model.number="form.attendees" type="number" min="0" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="form.description" class="form-control" rows="4" required></textarea>
              </div>

              <div v-if="formError" class="alert alert-danger py-2">
                {{ formError }}
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="luxury-btn flex-fill" :disabled="submitting">
                  {{ submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event' }}
                </button>
                <button type="button" class="btn btn-outline-secondary flex-fill" :disabled="submitting" @click="resetForm">
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div v-else class="empty-state compact-empty">
            <i :class="canManageEvents ? 'bi bi-pencil-square fs-2 mb-3' : 'bi bi-eye fs-2 mb-3'"></i>
            <p v-if="canManageEvents" class="mb-0">Pick an event to edit it or create a new one from the button above.</p>
            <p v-else class="mb-0">Guests can browse the calendar and existing event details, but only signed-in users can create, edit, or delete events.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useChurchStore, type Event } from '@/stores/church'
import { useAuthStore } from '@/stores/auth'
import type { EventPayload } from '@/services/eventService'

const churchStore = useChurchStore()
const authStore = useAuthStore()
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const environmentLabel = import.meta.env.VITE_ENVIRONMENT === 'Production'
  ? 'Production / Firestore'
  : 'Development / PHP API'

const showForm = ref(false)
const editingEventId = ref<string | null>(null)
const submitting = ref(false)
const formError = ref<string | null>(null)

const form = reactive<EventPayload>({
  title: '',
  date: '',
  time: '',
  location: '',
  description: '',
  attendees: 0
})

const today = new Date()

const parseEventDate = (date: string) => {
  const [year = 1970, month = 1, day = 1] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const displayedMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDateKey = ref(formatDateKey(today))

const isEditing = computed(() => editingEventId.value !== null)
const canManageEvents = computed(() => authStore.isAuthenticated)

const eventsByDate = computed<Record<string, Event[]>>(() => {
  return churchStore.events.reduce((groups, event) => {
    const dayEvents = groups[event.date] ?? []
    dayEvents.push(event)
    groups[event.date] = dayEvents
    return groups
  }, {} as Record<string, Event[]>)
})

const calendarDays = computed(() => {
  const monthStart = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth(), 1)
  const monthEnd = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth() + 1, 0)
  const startOffset = monthStart.getDay()
  const totalCells = Math.ceil((startOffset + monthEnd.getDate()) / 7) * 7
  const gridStart = new Date(monthStart)
  gridStart.setDate(monthStart.getDate() - startOffset)

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)

    const dateKey = formatDateKey(date)
    return {
      key: `${dateKey}-${index}`,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === displayedMonth.value.getMonth(),
      events: eventsByDate.value[dateKey] ?? []
    }
  })
})

const monthLabel = computed(() => {
  return displayedMonth.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const selectedDateLabel = computed(() => {
  return parseEventDate(selectedDateKey.value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

const selectedDayEvents = computed(() => {
  return eventsByDate.value[selectedDateKey.value] ?? []
})

const applyEventToForm = (event?: Event) => {
  form.title = event?.title ?? ''
  form.date = event?.date ?? selectedDateKey.value
  form.time = event?.time ?? ''
  form.location = event?.location ?? ''
  form.description = event?.description ?? ''
  form.attendees = event?.attendees ?? 0
}

const syncCalendarToEventData = () => {
  if (!churchStore.events.length) {
    displayedMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
    selectedDateKey.value = formatDateKey(today)
    return
  }

  const selectedHasEvents = churchStore.events.some((event) => event.date === selectedDateKey.value)

  if (!selectedHasEvents) {
    const firstEventDate = churchStore.events[0]?.date ?? formatDateKey(today)
    selectedDateKey.value = firstEventDate
    const selectedDate = parseEventDate(firstEventDate)
    displayedMonth.value = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  }
}

const selectDay = (dateKey: string) => {
  selectedDateKey.value = dateKey

  const selectedDate = parseEventDate(dateKey)
  displayedMonth.value = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
}

const goToPreviousMonth = () => {
  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() - 1,
    1
  )
}

const goToNextMonth = () => {
  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() + 1,
    1
  )
}

const openCreateForm = () => {
  if (!canManageEvents.value) {
    return
  }

  showForm.value = true
  editingEventId.value = null
  formError.value = null
  applyEventToForm()
}

const openEditForm = (event: Event) => {
  if (!canManageEvents.value) {
    return
  }

  showForm.value = true
  editingEventId.value = event.id
  formError.value = null
  applyEventToForm(event)
  selectDay(event.date)
}

const closeForm = () => {
  showForm.value = false
  editingEventId.value = null
  formError.value = null
}

const resetForm = () => {
  formError.value = null
  applyEventToForm(isEditing.value
    ? churchStore.events.find((event) => event.id === editingEventId.value)
    : undefined)
}

const validateForm = () => {
  if (!form.title || !form.date || !form.time || !form.location || !form.description) {
    return 'Please complete all event fields.'
  }

  if (form.attendees < 0) {
    return 'Attendees cannot be negative.'
  }

  return null
}

const submitForm = async () => {
  if (!canManageEvents.value) {
    return
  }

  formError.value = validateForm()

  if (formError.value) {
    return
  }

  submitting.value = true

  try {
    if (isEditing.value && editingEventId.value) {
      const updatedEvent = await churchStore.updateEvent(editingEventId.value, { ...form })
      selectDay(updatedEvent.date)
    } else {
      const createdEvent = await churchStore.createEvent({ ...form })
      selectDay(createdEvent.date)
    }

    closeForm()
    applyEventToForm()
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to save event.'
  } finally {
    submitting.value = false
  }
}

const removeEvent = async (id: string) => {
  if (!canManageEvents.value) {
    return
  }

  const shouldDelete = window.confirm('Delete this event?')

  if (!shouldDelete) {
    return
  }

  submitting.value = true

  try {
    await churchStore.deleteEvent(id)

    if (editingEventId.value === id) {
      closeForm()
    }

    syncCalendarToEventData()
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Unable to delete event.'
  } finally {
    submitting.value = false
  }
}

const refreshEvents = async () => {
  try {
    await churchStore.loadEvents(true)
    syncCalendarToEventData()
  } catch {
    // Store error state is already set.
  }
}

onMounted(async () => {
  await refreshEvents()
})
</script>

<style scoped>
.events-view {
  min-height: 100%;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.12);
  color: #6a542f;
  font-size: 0.78rem;
  font-weight: 700;
}

.calendar-shell,
.editor-shell {
  border-radius: 24px;
}

.calendar-toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.calendar-caption {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.78rem;
  color: #9b7b45;
}

.calendar-month {
  font-size: clamp(1.5rem, 2vw, 2.1rem);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.85rem;
}

.calendar-weekday {
  text-align: center;
  font-weight: 700;
  color: #7a6a52;
  padding-bottom: 0.5rem;
}

.calendar-day {
  border: 1px solid rgba(155, 123, 69, 0.18);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.98), rgba(247, 238, 219, 0.9));
  min-height: 150px;
  padding: 0.9rem;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.calendar-day-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.calendar-day:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(70, 49, 24, 0.08);
}

.calendar-day.is-outside-month {
  opacity: 0.45;
}

.calendar-day.has-events {
  border-color: rgba(155, 123, 69, 0.5);
}

.calendar-day.is-selected {
  border-color: #9b7b45;
  box-shadow: 0 14px 28px rgba(155, 123, 69, 0.18);
}

.calendar-day-number,
.calendar-bubble {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 700;
}

.calendar-day-number {
  width: 2rem;
  height: 2rem;
  color: #3d3124;
  background: rgba(255, 255, 255, 0.85);
}

.calendar-bubble {
  min-width: 1.8rem;
  height: 1.8rem;
  padding: 0 0.45rem;
  background: #9b7b45;
  color: #fff;
  font-size: 0.78rem;
}

.calendar-day-events {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.8rem;
}

.calendar-pill {
  display: block;
  padding: 0.45rem 0.6rem;
  border-radius: 12px;
  background: rgba(155, 123, 69, 0.12);
  color: #4c3c2b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.calendar-more {
  font-size: 0.82rem;
  color: #7a6a52;
}

.selected-day-panel {
  border-top: 1px solid rgba(155, 123, 69, 0.18);
  padding-top: 1.5rem;
}

.event-counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.12);
  color: #6a542f;
  font-weight: 700;
}

.event-detail-card {
  border: 1px solid rgba(155, 123, 69, 0.18);
  border-radius: 20px;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.72);
}

.event-meta p {
  margin-bottom: 0.5rem;
}

.event-form .form-control {
  border-radius: 14px;
  border-color: rgba(155, 123, 69, 0.2);
  padding: 0.8rem 0.95rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 220px;
  border: 1px dashed rgba(155, 123, 69, 0.28);
  border-radius: 20px;
  color: #7a6a52;
  background: rgba(255, 252, 246, 0.7);
}

.compact-empty {
  min-height: 320px;
}

@media (max-width: 991.98px) {
  .calendar-grid {
    gap: 0.65rem;
  }

  .calendar-day {
    min-height: 130px;
    padding: 0.75rem;
  }
}

@media (max-width: 767.98px) {
  .calendar-toolbar {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .calendar-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.35rem;
  }

  .calendar-weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 0.2rem;
    font-size: 0.78rem;
  }

  .calendar-day {
    min-height: 3rem;
    padding: 0.35rem 0.2rem;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 252, 246, 0.92);
  }

  .calendar-day.is-outside-month {
    opacity: 0.28;
  }

  .calendar-day-header {
    justify-content: center;
    align-items: center;
  }

  .calendar-day-events,
  .calendar-more,
  .calendar-bubble {
    display: none;
  }

  .calendar-day-number {
    width: 2.2rem;
    height: 2.2rem;
    font-size: 0.92rem;
    background: transparent;
  }

  .calendar-day.has-events .calendar-day-number {
    background: #9b7b45;
    color: #fff;
    box-shadow: 0 8px 18px rgba(155, 123, 69, 0.28);
  }

  .calendar-day.is-selected .calendar-day-number {
    outline: 2px solid rgba(61, 49, 36, 0.55);
    outline-offset: 1px;
  }

  .selected-day-panel {
    margin-top: 1rem;
  }

  .event-detail-card {
    padding: 1rem;
  }
}
</style>
