<template>
  <div class="p-4">
    <h2 class="mb-4">Church Reports</h2>
    
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="church-card p-4">
          <h4 class="mb-3">Membership Report</h4>
          <canvas id="membershipChart"></canvas>
          <div class="mt-3">
            <p><strong>Growth Rate:</strong> +15% this quarter</p>
            <p><strong>Average Attendance:</strong> 320 per service</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-4">
        <div class="church-card p-4">
          <h4 class="mb-3">Financial Summary</h4>
          <canvas id="financialChart"></canvas>
          <div class="mt-3">
            <p><strong>Monthly Average:</strong> $8,500</p>
            <p><strong>Top Giving Month:</strong> December ($15,000)</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="church-card p-4">
      <h4 class="mb-3">Ministry Impact Metrics</h4>
      <div class="row">
        <div class="col-md-3 text-center">
          <i class="bi bi-people fs-1 gold-text"></i>
          <h3>45</h3>
          <p>New Baptisms</p>
        </div>
        <div class="col-md-3 text-center">
          <i class="bi bi-heart fs-1 gold-text"></i>
          <h3>127</h3>
          <p>Community Served</p>
        </div>
        <div class="col-md-3 text-center">
          <i class="bi bi-book fs-1 gold-text"></i>
          <h3>8</h3>
          <p>Bible Study Groups</p>
        </div>
        <div class="col-md-3 text-center">
          <i class="bi bi-globe fs-1 gold-text"></i>
          <h3>12</h3>
          <p>Mission Trips</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { useChurchStore } from '../stores/church'

const churchStore = useChurchStore()

onMounted(() => {
  // Membership Growth Chart
  const membershipCtx = document.getElementById('membershipChart') as HTMLCanvasElement
  new Chart(membershipCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Members',
        data: [245, 248, 252, 258, 265, 272, 280, 288, 295, 302, 310, 320],
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  })
  
  // Financial Chart
  const financialCtx = document.getElementById('financialChart') as HTMLCanvasElement
  new Chart(financialCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Donations ($)',
        data: [5200, 4800, 6100, 5800, 7200, 6800, 7500, 8200, 7900, 8500, 9200, 15000],
        backgroundColor: 'rgba(212, 175, 55, 0.6)',
        borderColor: '#d4af37',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  })
})
</script>