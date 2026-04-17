import { defineStore } from 'pinia'
import axios from 'axios'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'
import { firebaseAuth } from '@/assets/firebase'

interface User {
  id: number
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

const isProduction = import.meta.env.VITE_ENVIRONMENT === 'Production'
const API_URL = import.meta.env.VITE_API_URL;

const setAxiosAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete axios.defaults.headers.common.Authorization
}

const getFirebaseAuth = () => {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured for this environment.')
  }

  return firebaseAuth
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null

      try {
        if (isProduction) {
          const userCredential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)

          this.token = await userCredential.user.getIdToken()
          this.user = {
            id: 0,
            name: userCredential.user.displayName || '',
            email: userCredential.user.email || email
          }

          localStorage.setItem('token', this.token)
          setAxiosAuthHeader(this.token)
          return true
        }

        const response = await axios.post(`${API_URL}/auth/login`, { email, password })
        const payload = response.data?.data

        this.token = payload?.token || ''
        this.user = payload?.user || null

        if (this.token) {
          localStorage.setItem('token', this.token)
          setAxiosAuthHeader(this.token)
        }

        return true
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.error || 'Login failed'
        } else {
          this.error = 'Login failed'
        }
        return false
      } finally {
        this.loading = false
      }
    },

    async register(name: string, email: string, password: string) {
      this.loading = true
      this.error = null

      try {
        if (isProduction) {
          const userCredential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)

          if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name })
          }

          this.token = await userCredential.user.getIdToken()
          this.user = { id: 0, name, email }

          localStorage.setItem('token', this.token)
          setAxiosAuthHeader(this.token)
          return true
        }

        const response = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password
        })

        this.user = response.data?.data?.user || null
        return true
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.error || 'Registration failed'
        } else {
          this.error = 'Registration failed'
        }
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true

      try {
        if (isProduction) {
          await signOut(getFirebaseAuth())
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        setAxiosAuthHeader(null)
        this.loading = false
      }
    },

    initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        setAxiosAuthHeader(token)
      }
    }
  }
})
