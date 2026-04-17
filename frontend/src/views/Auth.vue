<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>GKI Menteng</h2>
        <p class="text-muted">{{ isLogin ? 'Welcome back!' : 'Create your account' }}</p>
      </div>

      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: isLogin }"
            @click="isLogin = true"
          >
            Login
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: !isLogin }"
            @click="isLogin = false"
          >
            Register
          </button>
        </li>
      </ul>

      <form @submit.prevent="handleSubmit">
        <div v-if="!isLogin" class="mb-3">
          <label class="form-label">Full Name</label>
          <input 
            v-model="form.name" 
            type="text" 
            class="form-control" 
            :class="{ 'is-invalid': errors.name }"
            placeholder="Enter your full name"
          />
          <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email Address</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="form-control" 
            :class="{ 'is-invalid': errors.email }"
            placeholder="Enter your email"
          />
          <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Password</label>
          <div class="input-group">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control" 
              :class="{ 'is-invalid': errors.password }"
              placeholder="Enter your password"
            />
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="errors.password" class="invalid-feedback d-block">{{ errors.password }}</div>
        </div>

        <div v-if="!isLogin" class="mb-3">
          <label class="form-label">Confirm Password</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            class="form-control" 
            :class="{ 'is-invalid': errors.confirmPassword }"
            placeholder="Confirm your password"
          />
          <div v-if="errors.confirmPassword" class="invalid-feedback">{{ errors.confirmPassword }}</div>
        </div>

        <div v-if="authStore.error" class="alert alert-danger">{{ authStore.error }}</div>

        <button 
          type="submit" 
          class="btn btn-primary w-100 mb-3"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const showPassword = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  let valid = true
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!isLogin.value && !form.name.trim()) {
    errors.name = 'Name is required'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }

  if (!isLogin.value && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  let success = false

  if (isLogin.value) {
    success = await authStore.login(form.email, form.password)
    if (success) {
      router.push('/')
    }
  } else {
    success = await authStore.register(form.name, form.email, form.password)
    if (success) {
      isLogin.value = true
      form.name = ''
      form.confirmPassword = ''
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h2 {
  color: #333;
  font-weight: 700;
  margin-bottom: 8px;
}

.auth-header p {
  margin-bottom: 0;
}

.nav-tabs {
  border-bottom: none;
  justify-content: center;
  gap: 20px;
}

.nav-tabs .nav-link {
  border: none;
  color: #666;
  font-weight: 500;
  padding: 10px 20px;
  position: relative;
}

.nav-tabs .nav-link.active {
  color: #667eea;
  background: transparent;
}

.nav-tabs .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #667eea;
  border-radius: 3px;
}

.form-label {
  font-weight: 500;
  color: #444;
  margin-bottom: 8px;
}

.form-control {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: all 0.3s;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
}

.input-group .btn {
  border-color: #ddd;
}

.input-group .btn:focus {
  box-shadow: none;
}

.alert-danger {
  border-radius: 8px;
  font-size: 14px;
}
</style>