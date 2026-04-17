import { defineStore } from 'pinia'
import axios from 'axios'

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

const API_URL = import.meta.env.VITE_API_URL;

const isProduction = import.meta.env.VITE_ENVIRONMENT === 'Production'

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
          const { default: firebaseAuth } = await import('firebase/auth')
          const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth')
          const { initializeApp } = await import('firebase/app')
          const { firebaseConfig } = await import('@/assets/firebase')
          
          initializeApp(firebaseConfig)
          const auth = getAuth()
          
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          this.token = await userCredential.user.getIdToken()
          localStorage.setItem('token', this.token!)
          return true
        } else {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          })
          
          this.token = response.data.token || ''
          this.user = response.data.user
          if (this.token) {
            localStorage.setItem('token', this.token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          }
          
          return true
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Login failed'
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
          const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
          const { initializeApp } = await import('firebase/app')
          const { firebaseConfig } = await import('@/assets/firebase')
          
          initializeApp(firebaseConfig)
          const auth = getAuth()
          
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          
          if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name })
          }
          
          this.token = await userCredential.user.getIdToken()
          localStorage.setItem('token', this.token!)
          
          this.user = { id: 0, name, email }
          return true
        } else {
          const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password
          })
          
          this.user = response.data.user
          return true
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Registration failed'
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
          const { getAuth, signOut } = await import('firebase/auth')
          const { initializeApp } = await import('firebase/app')
          const { firebaseConfig } = await import('@/assets/firebase')
          
          initializeApp(firebaseConfig)
          const auth = getAuth()
          await signOut(auth)
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        this.loading = false
      }
    },

    initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
  }
})