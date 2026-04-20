<template>
  <div class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Church Members</h2>
      <button v-if="authStore.isAuthenticated" class="luxury-btn" data-bs-toggle="modal" data-bs-target="#addMemberModal">
        <i class="bi bi-person-plus-fill me-2"></i>Add Member
      </button>
    </div>
    
    <div class="church-card p-4">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Join Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in churchStore.members" :key="member.id">
              <td><strong>{{ member.name }}</strong></td>
              <td>{{ member.role }}</td>
              <td>{{ member.email }}</td>
              <td>{{ member.phone }}</td>
              <td>{{ formatDate(member.joinDate) }}</td>
              <td>
                <span :class="member.status === 'active' ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ member.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Add Member Modal -->
    <div class="modal fade" id="addMemberModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Member</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addNewMember">
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" v-model="newMember.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="newMember.email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-control" v-model="newMember.phone" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <input type="text" class="form-control" v-model="newMember.role" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="newMember.status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" class="luxury-btn w-100">Add Member</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useChurchStore } from '../stores/church'
import { useAuthStore } from '../stores/auth'

const churchStore = useChurchStore()
const authStore = useAuthStore()

const getTodayDate = (): string => new Date().toISOString().split('T')[0] ?? ''

const newMember = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  status: 'active' as const,
  joinDate: getTodayDate()
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  try {
    await churchStore.loadMembers()
  } catch (error) {
    console.error('Failed to load members:', error)
  }
})

const addNewMember = async () => {
  if (!authStore.isAuthenticated) {
    return
  }
  if (!newMember.value.name || !newMember.value.email) {
    return
  }
  const today = getTodayDate()
  try {
    await churchStore.addMember({
      name: newMember.value.name,
      email: newMember.value.email,
      phone: newMember.value.phone || '',
      role: newMember.value.role || '',
      status: newMember.value.status || 'active',
      joinDate: today
    })

    const modal = document.getElementById('addMemberModal')
    if (modal) {
      // @ts-ignore
      const bsModal = bootstrap.Modal.getInstance(modal)
      bsModal?.hide()
    }

    newMember.value = {
      name: '',
      email: '',
      phone: '',
      role: '',
      status: 'active',
      joinDate: getTodayDate()
    }
  } catch (error) {
    console.error('Failed to create member:', error)
  }
}
</script>
