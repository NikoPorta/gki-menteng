<template>
  <div class="p-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="church-card p-4 text-center">
          <h1 class="display-5">Welcome to Grace Cathedral</h1>
          <p class="lead">"Let everything that has breath praise the LORD" - Psalm 150:6</p>
        </div>
      </div>
    </div>
    
    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted">Total Members</h6>
              <h2 class="mb-0">{{ churchStore.totalMembers }}</h2>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> 12% this month
              </small>
            </div>
            <i class="bi bi-people-fill gold-text fs-1"></i>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted">Active Members</h6>
              <h2 class="mb-0">{{ churchStore.activeMembers }}</h2>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> 5% this week
              </small>
            </div>
            <i class="bi bi-person-check-fill gold-text fs-1"></i>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted">Total Donations</h6>
              <h2 class="mb-0">${{ formatNumber(churchStore.totalDonations) }}</h2>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> 23% increase
              </small>
            </div>
            <i class="bi bi-cash-stack gold-text fs-1"></i>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted">Building Fund</h6>
              <h2 class="mb-0">${{ formatNumber(churchStore.buildingFundTotal) }}</h2>
              <small class="text-success">
                <i class="bi bi-trophy"></i> Goal: $50,000
              </small>
            </div>
            <i class="bi bi-building gold-text fs-1"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts and Recent Activity -->
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="church-card p-4">
          <h4 class="mb-3">Upcoming Events</h4>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Attendees</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in churchStore.upcomingEvents" :key="event.id">
                  <td><strong>{{ event.title }}</strong></td>
                  <td>{{ formatDate(event.date) }}</td>
                  <td>{{ event.time }}</td>
                  <td>{{ event.location }}</td>
                  <td>{{ event.attendees }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4 mb-4">
        <div class="church-card p-4">
          <h4 class="mb-3">Recent Donations</h4>
          <div v-for="donation in churchStore.recentDonations" :key="donation.id" class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ donation.donor }}</strong>
                <br>
                <small class="text-muted">{{ donation.purpose }}</small>
              </div>
              <div class="text-end">
                <span class="gold-text fw-bold">${{ formatNumber(donation.amount) }}</span>
                <br>
                <small class="text-muted">{{ formatDate(donation.date) }}</small>
              </div>
            </div>
            <hr class="my-2">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChurchStore } from '../stores/church'

const churchStore = useChurchStore()

const formatNumber = (value: number) => {
  return value.toLocaleString()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>