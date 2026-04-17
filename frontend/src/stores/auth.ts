import { defineStore } from 'pinia'
import axios from 'axios'
import type { User as FirebaseUser } from 'firebase/auth'
import { firebaseConfig } from '@/assets/firebase'

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
  firebaseUser: FirebaseUser | null
}

const API_URL = '/api'

let auth: ReturnType<typeof import('firebase/auth').getAuth> | null = null
let firebaseInitialized = false

async function getFirebaseAuth() {
  if (auth) return auth
  
  const { getAuth } = await import('firebase/auth')
  const { initializeApp } = await import('firebase/app')
  
  if (!firebaseInitialized) {
    initializeApp(firebaseConfig)
    firebaseInitialized = true
  }
  auth = getAuth()
  return auth
}

function useFirebaseAuth(): boolean {
  const envValue = import.meta.env.VITE_ENVIRONMENT
  console.log('[Auth] VITE_ENVIRONMENT =', envValue)
  return envValue === 'Production'
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    firebaseUser: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token || !!state.firebaseUser,
    currentUser: (state) => state.user || (state.firebaseUser ? { 
      id: 0, 
      name: state.firebaseUser.displayName || state.firebaseUser.email?.split('@')[0] || 'User', 
      email: state.firebaseUser.email || '' 
    } : null)
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      
      if (useFirebaseAuth()) {
        try {
          const firebaseAuth = await getFirebaseAuth()
          const { signInWithEmailAndPassword } = await import('firebase/auth')
          
          const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
          this.firebaseUser = userCredential.user
          this.token = await userCredential.user.getIdToken()
          localStorage.setItem('token', this.token!)
          return true
        } catch (error) {
          this.error = (error as Error).message || 'Login failed'
          return false
        } finally {
          this.loading = false
        }
      } else {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          })
          
          this.token = response.data.token
          this.user = response.data.user
          localStorage.setItem('token', this.token)
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          
          return true
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
      }
    },

    async register(name: string, email: string, password: string) {
      this.loading = true
      this.error = null
      
      if (useFirebaseAuth()) {
        try {
          const firebaseAuth = await getFirebaseAuth()
          const { createUserWithEmailAndPassword } = await import('firebase/auth')
          
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
          this.firebaseUser = userCredential.user
          
          if (userCredential.user) {
            const { updateProfile } = await import('firebase/auth')
            await updateProfile(userCredential.user, { displayName: name })
          }
          
          this.token = await userCredential.user.getIdToken()
          localStorage.setItem('token', this.token!)
          
          this.user = {
            id: 0,
            name,
            email
          }
          
          return true
        } catch (error) {
          this.error = (error as Error).message || 'Registration failed'
          return false
        } finally {
          this.loading = false
        }
      } else {
        try {
          const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password
          })
          
          this.user = response.data.user
          return true
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
      }
    },

    async logout() {
      this.loading = true
      
      try {
        if (useFirebaseAuth() && auth) {
          const { signOut } = await import('firebase/auth')
          await signOut(auth)
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        this.firebaseUser = null
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
      
      if (useFirebaseAuth()) {
        getFirebaseAuth().then(async (firebaseAuth) => {
          const { onAuthStateChanged } = await import('firebase/auth')
          onAuthStateChanged(firebaseAuth, (user) => {
            this.firebaseUser = user
          })
        })
      }
    }
  }
})