<template>
  <div class="auth-shell">
    <div class="auth-glow auth-glow-left"></div>
    <div class="auth-glow auth-glow-right"></div>

    <section class="auth-layout">
      <aside class="auth-sanctuary">
        <div class="sanctuary-badge">
          <i class="bi bi-stars"></i>
          A place to grow in faith and service
        </div>

        <div class="sanctuary-copy">
          <p class="eyebrow">GKI Menteng</p>
          <h1>{{ heroTitle }}</h1>
          <p class="lead-text">
            {{ heroDescription }}
          </p>
        </div>

        <div class="scripture-panel">
          <div class="scripture-icon">
            <i class="bi bi-book"></i>
          </div>
          <p class="scripture-quote">
            "Let all that you do be done in love."
          </p>
          <p class="scripture-source">1 Corinthians 16:14</p>
        </div>

        <div class="sanctuary-highlights">
          <div class="highlight-item">
            <i class="bi bi-heart-fill"></i>
            <div>
              <h3>Warm community</h3>
              <p>Stay close to worship, fellowship, and pastoral care.</p>
            </div>
          </div>
          <div class="highlight-item">
            <i class="bi bi-calendar2-check-fill"></i>
            <div>
              <h3>Meaningful participation</h3>
              <p>Join events, ministries, and church moments with ease.</p>
            </div>
          </div>
          <div class="highlight-item">
            <i class="bi bi-shield-lock-fill"></i>
            <div>
              <h3>Quietly secure</h3>
              <p>Your account stays protected while the experience stays calm.</p>
            </div>
          </div>
        </div>
      </aside>

      <div class="auth-card">
        <div class="auth-card-inner">
          <div class="auth-header">
            <div class="brand-mark">
              <i class="bi bi-church"></i>
            </div>
            <p class="eyebrow">{{ isLogin ? 'Welcome back' : 'Begin your journey' }}</p>
            <h2>{{ isLogin ? 'Sign in to your church home' : 'Create your congregation account' }}</h2>
            <p class="subtitle">
              {{ isLogin ? 'Enter your details to continue in peace.' : 'Register to connect with worship, service, and community life.' }}
            </p>
          </div>

          <div class="auth-switcher" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              class="switch-pill"
              :class="{ active: isLogin }"
              @click="setAuthMode(true)"
            >
              Login
            </button>
            <button
              type="button"
              class="switch-pill"
              :class="{ active: !isLogin }"
              @click="setAuthMode(false)"
            >
              Register
            </button>
          </div>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div v-if="!isLogin" class="field-block">
              <label class="form-label">Full Name</label>
              <div class="field-wrap">
                <i class="bi bi-person form-icon"></i>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control auth-input"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="Enter your full name"
                />
              </div>
              <div v-if="errors.name" class="invalid-feedback d-block">{{ errors.name }}</div>
            </div>

            <div class="field-block">
              <label class="form-label">Email Address</label>
              <div class="field-wrap">
                <i class="bi bi-envelope form-icon"></i>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control auth-input"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="Enter your email"
                />
              </div>
              <div v-if="errors.email" class="invalid-feedback d-block">{{ errors.email }}</div>
            </div>

            <div class="field-block">
              <label class="form-label">Password</label>
              <div class="field-wrap password-wrap">
                <i class="bi bi-lock form-icon"></i>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control auth-input"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Enter your password"
                />
                <button
                  class="password-toggle"
                  type="button"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div v-if="errors.password" class="invalid-feedback d-block">{{ errors.password }}</div>
            </div>

            <div v-if="!isLogin" class="field-block">
              <label class="form-label">Confirm Password</label>
              <div class="field-wrap">
                <i class="bi bi-check2-circle form-icon"></i>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-control auth-input"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  placeholder="Confirm your password"
                />
              </div>
              <div v-if="errors.confirmPassword" class="invalid-feedback d-block">{{ errors.confirmPassword }}</div>
            </div>

            <div class="auth-note">
              <i class="bi bi-shield-check"></i>
              <span>{{ isLogin ? 'Your access helps keep church records and ministry data safe.' : 'A few details now will make it easier to serve and stay connected later.' }}</span>
            </div>

            <div v-if="authStore.error" class="alert alert-danger auth-alert">{{ authStore.error }}</div>

            <button
              type="submit"
              class="btn submit-btn w-100"
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLogin ? 'Enter the portal' : 'Create my account' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const showPassword = ref(false)

const heroTitle = computed(() =>
  isLogin.value
    ? 'Return to a calm and gracious digital sanctuary.'
    : 'Step into a thoughtful space for worship, fellowship, and care.'
)

const heroDescription = computed(() =>
  isLogin.value
    ? 'Access your church dashboard with an interface shaped to feel reverent, warm, and quietly elegant.'
    : 'Create your account to stay connected with church life through a welcoming experience inspired by sacred spaces.'
)

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

const resetErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
}

const setAuthMode = (loginMode: boolean) => {
  isLogin.value = loginMode
  showPassword.value = false
  resetErrors()
  authStore.error = null

  if (loginMode) {
    form.name = ''
    form.confirmPassword = ''
  }
}

const validateForm = () => {
  let valid = true
  resetErrors()

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
      setAuthMode(true)
      form.name = ''
      form.confirmPassword = ''
    }
  }
}
</script>

<style scoped>
.auth-shell {
  --auth-bg: #f6ead7;
  --auth-brown: #2f1b14;
  --auth-brown-soft: #5a3d30;
  --auth-gold: #cda349;
  --auth-gold-deep: #a67922;
  --auth-cream: #fffaf2;
  --auth-border: rgba(114, 72, 32, 0.16);
  --auth-shadow: 0 24px 80px rgba(56, 31, 19, 0.18);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top left, rgba(205, 163, 73, 0.28), transparent 32%),
    radial-gradient(circle at bottom right, rgba(126, 89, 52, 0.18), transparent 28%),
    linear-gradient(135deg, #f8eddd 0%, #f1ddc1 48%, #ecd1ac 100%);
}

.auth-glow {
  position: absolute;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  filter: blur(14px);
  opacity: 0.45;
  pointer-events: none;
}

.auth-glow-left {
  top: -80px;
  left: -100px;
  background: radial-gradient(circle, rgba(255, 243, 204, 0.9) 0%, rgba(212, 175, 55, 0) 70%);
}

.auth-glow-right {
  right: -120px;
  bottom: -120px;
  background: radial-gradient(circle, rgba(164, 119, 69, 0.26) 0%, rgba(164, 119, 69, 0) 70%);
}

.auth-layout {
  position: relative;
  z-index: 1;
  max-width: 1220px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: rgba(255, 250, 242, 0.56);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: var(--auth-shadow);
  backdrop-filter: blur(18px);
}

.auth-sanctuary {
  position: relative;
  padding: 56px;
  background:
    linear-gradient(180deg, rgba(47, 27, 20, 0.92) 0%, rgba(73, 44, 28, 0.9) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'%3E%3Cpath d='M70 18l8 20 20 8-20 8-8 20-8-20-20-8 20-8z'/%3E%3Cpath d='M70 74l8 20 20 8-20 8-8 20-8-20-20-8 20-8z'/%3E%3C/g%3E%3C/svg%3E");
  color: #fff5e5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
}

.auth-sanctuary::after {
  content: '';
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  pointer-events: none;
}

.sanctuary-badge,
.eyebrow {
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
}

.sanctuary-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #f6ddb0;
}

.sanctuary-copy h1 {
  max-width: 12ch;
  margin: 14px 0 18px;
  font-size: clamp(2.8rem, 5vw, 4.8rem);
  line-height: 0.95;
  color: #fffaf2;
}

.lead-text {
  max-width: 560px;
  font-size: 1.05rem;
  line-height: 1.8;
  color: rgba(255, 245, 229, 0.84);
}

.scripture-panel {
  position: relative;
  padding: 24px 24px 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(205, 163, 73, 0.16));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.scripture-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  color: #f6ddb0;
  font-size: 1.2rem;
}

.scripture-quote {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.7rem;
  line-height: 1.25;
  margin-bottom: 8px;
  color: #fff8ee;
}

.scripture-source {
  margin-bottom: 0;
  color: #f6ddb0;
  font-size: 0.95rem;
}

.sanctuary-highlights {
  display: grid;
  gap: 16px;
}

.highlight-item {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  align-items: start;
}

.highlight-item i {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--auth-gold);
}

.highlight-item h3 {
  margin-bottom: 4px;
  font-size: 1.15rem;
  color: #fff6e8;
}

.highlight-item p {
  margin: 0;
  color: rgba(255, 245, 229, 0.74);
  line-height: 1.6;
}

.auth-card {
  padding: 28px;
  background:
    linear-gradient(180deg, rgba(255, 252, 247, 0.96) 0%, rgba(251, 245, 236, 0.98) 100%);
}

.auth-card-inner {
  height: 100%;
  padding: 36px;
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 250, 242, 0.92) 100%);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.brand-mark {
  width: 74px;
  height: 74px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  color: var(--auth-gold-deep);
  font-size: 1.8rem;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(240, 221, 178, 0.9) 55%, rgba(205, 163, 73, 0.5) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 14px 28px rgba(166, 121, 34, 0.18);
}

.auth-header .eyebrow {
  color: var(--auth-gold-deep);
  margin-bottom: 12px;
}

.auth-header h2 {
  color: var(--auth-brown);
  font-size: clamp(2rem, 3vw, 2.7rem);
  line-height: 1.05;
  margin-bottom: 12px;
}

.subtitle {
  margin: 0 auto;
  max-width: 420px;
  color: var(--auth-brown-soft);
  line-height: 1.7;
}

.auth-switcher {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 8px;
  margin-bottom: 28px;
  background: rgba(205, 163, 73, 0.14);
  border-radius: 18px;
}

.switch-pill {
  border: 0;
  border-radius: 14px;
  padding: 14px 18px;
  font-weight: 700;
  color: var(--auth-brown-soft);
  background: transparent;
  transition: all 0.3s ease;
}

.switch-pill.active {
  color: var(--auth-brown);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 233, 204, 0.95));
  box-shadow: 0 8px 18px rgba(136, 96, 45, 0.12);
}

.auth-form {
  display: grid;
  gap: 18px;
}

.form-label {
  font-weight: 700;
  color: var(--auth-brown);
  margin-bottom: 10px;
}

.field-block {
  display: grid;
}

.field-wrap {
  position: relative;
}

.form-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(90, 61, 48, 0.6);
  z-index: 1;
}

.auth-input {
  min-height: 58px;
  padding: 14px 18px 14px 50px;
  border-radius: 18px;
  border: 1px solid var(--auth-border);
  background: rgba(255, 255, 255, 0.9);
  color: var(--auth-brown);
  transition: all 0.25s ease;
}

.auth-input::placeholder {
  color: rgba(90, 61, 48, 0.5);
}

.auth-input:focus {
  border-color: rgba(205, 163, 73, 0.72);
  box-shadow: 0 0 0 4px rgba(205, 163, 73, 0.12);
  background: #fffdf9;
}

.password-wrap .auth-input {
  padding-right: 60px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(205, 163, 73, 0.14);
  color: var(--auth-gold-deep);
  transition: all 0.25s ease;
}

.password-toggle:hover {
  background: rgba(205, 163, 73, 0.22);
}

.auth-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(205, 163, 73, 0.1);
  color: var(--auth-brown-soft);
  font-size: 0.96rem;
  line-height: 1.6;
}

.auth-note i {
  color: var(--auth-gold-deep);
  margin-top: 2px;
}

.auth-alert {
  margin-bottom: 0;
  border: 1px solid rgba(173, 58, 58, 0.18);
  border-radius: 16px;
  background: rgba(255, 237, 237, 0.85);
  color: #8a3030;
}

.submit-btn {
  min-height: 58px;
  border: 0;
  border-radius: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fffaf2;
  background: linear-gradient(135deg, #b88930 0%, #d8b05d 48%, #8e6320 100%);
  box-shadow: 0 16px 30px rgba(166, 121, 34, 0.26);
  transition: transform 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: saturate(1.05);
  box-shadow: 0 20px 34px rgba(166, 121, 34, 0.32);
}

.submit-btn:disabled {
  opacity: 0.7;
  box-shadow: none;
}

.is-invalid {
  border-color: rgba(183, 66, 66, 0.55);
}

.invalid-feedback {
  margin-top: 8px;
  font-size: 0.88rem;
}

@media (max-width: 991.98px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-sanctuary {
    padding: 36px 28px;
  }

  .auth-card {
    padding: 18px;
  }

  .auth-card-inner {
    padding: 28px 22px;
  }
}

@media (max-width: 575.98px) {
  .auth-shell {
    padding: 16px;
  }

  .auth-layout {
    border-radius: 24px;
  }

  .auth-sanctuary,
  .auth-card-inner {
    padding: 24px 18px;
  }

  .sanctuary-copy h1 {
    max-width: none;
    font-size: 2.5rem;
  }

  .auth-header h2 {
    font-size: 1.85rem;
  }

  .switch-pill {
    padding: 12px 10px;
  }
}
</style>
