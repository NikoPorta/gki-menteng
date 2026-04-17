<template>
  <div class="volunteers-view p-4">
    <div class="church-card hero-card p-4 p-lg-5 mb-4">
      <div class="row align-items-center g-4">
        <div class="col-lg-7">
          <p class="section-kicker mb-2">Sunday Service Team</p>
          <h1 class="mb-3">Volunteers who help every Sunday service run with care and excellence.</h1>
          <p class="lead text-muted mb-4">
            Keep a simple overview of members serving in music, media, production, and worship coordination.
          </p>
          <div class="d-flex flex-wrap gap-2">
            <span class="summary-chip">
              <i class="bi bi-people-fill me-2"></i>{{ volunteers.length }} volunteers
            </span>
            <span class="summary-chip">
              <i class="bi bi-stars me-2"></i>{{ activeServices.length }} service areas
            </span>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="hero-panel">
            <div
              v-for="service in serviceStats"
              :key="service.name"
              class="hero-stat"
            >
              <span>{{ service.name }}</span>
              <strong>{{ service.count }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-xl-3 col-md-6" v-for="service in serviceStats" :key="service.name">
        <div class="stat-card service-stat-card h-100">
          <p class="text-muted mb-2">{{ service.name }}</p>
          <h2 class="mb-2">{{ service.count }}</h2>
          <small>{{ service.count === 1 ? 'Volunteer assigned' : 'Volunteers assigned' }}</small>
        </div>
      </div>
    </div>

    <div class="church-card control-card p-4 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-lg-4">
          <label class="form-label">Search volunteer</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search by name, service, or skill"
          >
        </div>
        <div class="col-lg-4">
          <label class="form-label">Filter by service</label>
          <select v-model="selectedService" class="form-select">
            <option value="All">All services</option>
            <option v-for="service in services" :key="service" :value="service">
              {{ service }}
            </option>
          </select>
        </div>
        <div class="col-lg-4">
          <button
            class="luxury-btn w-100"
            :disabled="!canManageVolunteers"
            data-bs-toggle="modal"
            data-bs-target="#addVolunteerModal"
          >
            <i class="bi bi-person-heart me-2"></i>Add Volunteer
          </button>
        </div>
      </div>
      <p class="text-muted small mt-3 mb-0">
        Volunteer list is public. Adding new volunteers requires a signed-in account.
      </p>
    </div>

    <div class="church-card p-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <p class="section-kicker mb-1">Volunteer Directory</p>
          <h3 class="mb-0">{{ filteredVolunteers.length }} member{{ filteredVolunteers.length === 1 ? '' : 's' }}</h3>
        </div>
        <span class="summary-chip neutral-chip">
          Sunday service participation roster
        </span>
      </div>

      <div v-if="loadingVolunteers" class="empty-state volunteer-empty">
        <i class="bi bi-hourglass-split fs-2 mb-3"></i>
        <p class="mb-0">Loading volunteers...</p>
      </div>

      <div v-else-if="filteredVolunteers.length" class="row g-4">
        <div class="col-xl-4 col-md-6" v-for="volunteer in filteredVolunteers" :key="volunteer.id">
          <article class="volunteer-card h-100">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <p class="section-kicker mb-1">Volunteer</p>
                <h4 class="mb-1">{{ volunteer.name }}</h4>
                <span class="service-badge">{{ volunteer.service }}</span>
              </div>
              <div class="avatar-badge">
                {{ volunteer.name.charAt(0) }}
              </div>
            </div>

            <div class="info-stack">
              <div v-if="authStore.isAuthenticated" class="info-row">
                <i class="bi bi-telephone-fill"></i>
                <span>{{ volunteer.contact }}</span>
              </div>
              <div v-else class="info-row text-muted">
                <i class="bi bi-telephone-fill"></i>
                <span>***** (login to view)</span>
              </div>
              <div v-if="volunteer.skills.length" class="skill-block">
                <p class="mb-2 fw-semibold">Skills</p>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="skill in volunteer.skills" :key="skill" class="skill-pill">
                    {{ skill }}
                  </span>
                </div>
              </div>
              <div v-else class="empty-skill-note">
                Worship Committee service does not require a skills list.
              </div>
            </div>
          </article>
        </div>
      </div>

      <div v-else class="empty-state volunteer-empty">
        <i class="bi bi-search fs-2 mb-3"></i>
        <p class="mb-0">No volunteers match the current search or service filter.</p>
      </div>
    </div>

    <div v-if="volunteersError" class="alert alert-danger mb-4">
      {{ volunteersError }}
    </div>

    <div class="modal fade" id="addVolunteerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content volunteer-modal">
          <div class="modal-header border-0 pb-0">
            <div>
              <p class="section-kicker mb-1">Sunday Service Team</p>
              <h5 class="modal-title">Add Volunteer</h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-3">
            <form @submit.prevent="addVolunteer">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model="newVolunteer.name" type="text" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Service</label>
                <select v-model="newVolunteer.service" class="form-select" required>
                  <option v-for="service in services" :key="service" :value="service">
                    {{ service }}
                  </option>
                </select>
              </div>

              <div v-if="showSkillsField" class="mb-3">
                <label class="form-label">Skills</label>
                <input
                  v-model="newVolunteer.skillsInput"
                  type="text"
                  class="form-control"
                  placeholder="Piano, Sound System, Streaming"
                >
                <small class="text-muted">Separate each skill with a comma.</small>
              </div>

              <div v-else class="committee-note mb-3">
                <i class="bi bi-info-circle-fill me-2"></i>
                Worship Committee does not need a skills field.
              </div>

              <div class="mb-4">
                <label class="form-label">Contact</label>
                <input v-model="newVolunteer.contact" type="text" class="form-control" required>
              </div>

              <button type="submit" class="luxury-btn w-100" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Save Volunteer' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useChurchStore } from '@/stores/church'
import { useAuthStore } from '@/stores/auth'
import type { VolunteerServiceName } from '@/services/volunteerService'

const churchStore = useChurchStore()
const authStore = useAuthStore()
const services: VolunteerServiceName[] = ['Musician', 'Soundman', 'Multimedia', 'Streaming', 'Worship Committee']

const searchQuery = ref('')
const selectedService = ref<'All' | VolunteerServiceName>('All')
const submitting = ref(false)

const newVolunteer = reactive<{
  name: string
  service: VolunteerServiceName
  skillsInput: string
  contact: string
}>({
  name: '',
  service: 'Musician',
  skillsInput: '',
  contact: ''
})

const showSkillsField = computed(() => newVolunteer.service !== 'Worship Committee')
const volunteers = computed(() => churchStore.volunteers)
const loadingVolunteers = computed(() => churchStore.volunteersLoading)
const volunteersError = computed(() => churchStore.volunteersError)
const canManageVolunteers = computed(() => authStore.isAuthenticated)

watch(() => newVolunteer.service, (service) => {
  if (service === 'Worship Committee') {
    newVolunteer.skillsInput = ''
  }
})

const filteredVolunteers = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  return volunteers.value.filter((volunteer) => {
    const matchesService = selectedService.value === 'All' || volunteer.service === selectedService.value
    const matchesQuery = !keyword
      || volunteer.name.toLowerCase().includes(keyword)
      || volunteer.service.toLowerCase().includes(keyword)
      || volunteer.skills.some((skill) => skill.toLowerCase().includes(keyword))

    return matchesService && matchesQuery
  })
})

const serviceStats = computed(() => {
  return services.map((service) => ({
    name: service,
    count: volunteers.value.filter((volunteer) => volunteer.service === service).length
  }))
})

const activeServices = computed(() => {
  return serviceStats.value.filter((service) => service.count > 0)
})

const resetForm = () => {
  newVolunteer.name = ''
  newVolunteer.service = 'Musician'
  newVolunteer.skillsInput = ''
  newVolunteer.contact = ''
}

const addVolunteer = async () => {
  const skills = newVolunteer.service === 'Worship Committee'
    ? []
    : newVolunteer.skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

  submitting.value = true

  try {
    await churchStore.createVolunteer({
      name: newVolunteer.name.trim(),
      service: newVolunteer.service,
      skills,
      contact: newVolunteer.contact.trim()
    })
  } catch {
    return
  } finally {
    submitting.value = false
  }

  const modal = document.getElementById('addVolunteerModal')
  if (modal) {
    modal.classList.remove('show')
    modal.style.display = 'none'
    const backdrop = document.querySelector('.modal-backdrop')
    backdrop?.remove()
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  }

  resetForm()
}

onMounted(async () => {
  try {
    await churchStore.loadVolunteers()
  } catch {
    // Store error state is already rendered in the template.
  }
})
</script>

<style scoped>
.volunteers-view {
  min-height: 100%;
}

.hero-card {
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(circle at top right, rgba(212, 175, 55, 0.18), transparent 32%),
    linear-gradient(135deg, rgba(255, 251, 243, 0.98), rgba(245, 232, 205, 0.94));
}

.section-kicker {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.76rem;
  color: #9b7b45;
  font-weight: 700;
}

.hero-panel {
  display: grid;
  gap: 0.85rem;
}

.hero-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(155, 123, 69, 0.14);
}

.hero-stat strong {
  font-size: 1.35rem;
  color: #5b451f;
}

.service-stat-card {
  border-left-width: 0;
  border-top: 4px solid #d4af37;
}

.control-card .form-control,
.control-card .form-select,
.volunteer-modal .form-control,
.volunteer-modal .form-select {
  border-radius: 14px;
  border-color: rgba(155, 123, 69, 0.22);
  padding: 0.8rem 0.95rem;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  background: rgba(155, 123, 69, 0.12);
  color: #5f4a28;
  font-weight: 700;
}

.neutral-chip {
  background: rgba(44, 24, 16, 0.08);
}

.volunteer-card {
  border: 1px solid rgba(155, 123, 69, 0.16);
  border-radius: 24px;
  padding: 1.4rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 241, 225, 0.9));
  box-shadow: 0 14px 30px rgba(58, 37, 14, 0.08);
}

.service-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.18);
  color: #6e541e;
  font-size: 0.82rem;
  font-weight: 700;
}

.avatar-badge {
  width: 3rem;
  height: 3rem;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d4af37, #b8960c);
  color: #2c1810;
  font-weight: 700;
  font-size: 1.15rem;
  box-shadow: 0 10px 20px rgba(212, 175, 55, 0.28);
}

.info-stack {
  display: grid;
  gap: 1rem;
}

.info-row {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: #5d4d39;
  font-weight: 500;
}

.skill-block {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(155, 123, 69, 0.12);
}

.skill-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  background: rgba(44, 24, 16, 0.07);
  color: #4f3b24;
  font-size: 0.82rem;
  font-weight: 600;
}

.empty-skill-note,
.committee-note {
  padding: 0.95rem 1rem;
  border-radius: 16px;
  background: rgba(155, 123, 69, 0.08);
  color: #725a31;
}

.volunteer-modal {
  border-radius: 24px;
  border: 1px solid rgba(155, 123, 69, 0.16);
  background: linear-gradient(180deg, #fffefb, #f7f0df);
}

.volunteer-empty {
  min-height: 260px;
}

@media (max-width: 767.98px) {
  .volunteer-card {
    padding: 1.1rem;
  }

  .hero-card h1 {
    font-size: 2rem;
  }
}
</style>
