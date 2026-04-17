<template>
  <div class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Donations & Offerings</h2>
      <button class="luxury-btn" data-bs-toggle="modal" data-bs-target="#addDonationModal">
        <i class="bi bi-cash-stack me-2"></i>Record Donation
      </button>
    </div>
    
    <div class="row mb-4">
      <div class="col-md-6 mb-3">
        <div class="stat-card text-center">
          <h6>Total Tithes & Offerings</h6>
          <h2 class="gold-text">${{ formatNumber(churchStore.totalDonations) }}</h2>
          <small>Year to Date</small>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="stat-card text-center">
          <h6>Building Fund Progress</h6>
          <h2 class="gold-text">${{ formatNumber(churchStore.buildingFundTotal) }}</h2>
          <div class="progress mt-2">
            <div class="progress-bar bg-gold" :style="{ width: buildingFundPercentage + '%' }">
              {{ buildingFundPercentage }}%
            </div>
          </div>
          <small>Goal: $50,000</small>
        </div>
      </div>
    </div>
    
    <div class="church-card p-4">
      <h4 class="mb-3">Recent Donations</h4>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="donation in churchStore.donations" :key="donation.id">
              <td><strong>{{ donation.donor }}</strong></td>
              <td class="gold-text fw-bold">${{ formatNumber(donation.amount) }}</td>
              <td>{{ formatDate(donation.date) }}</td>
              <td>{{ donation.purpose }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChurchStore } from '../stores/church'

const churchStore = useChurchStore()

const buildingFundPercentage = computed(() => {
  return (churchStore.buildingFundTotal / 50000) * 100
})

const formatNumber = (value: number) => {
  return value.toLocaleString()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>