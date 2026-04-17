import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
}

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
)

export const firebaseApp: FirebaseApp | null = hasFirebaseConfig
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null
export const firestore: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null

let analyticsInstance: Analytics | null = null

if (typeof window !== 'undefined' && firebaseApp) {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(firebaseApp)
    }
  }).catch(() => {
    analyticsInstance = null
  })
}

export const analytics = analyticsInstance
