import axios from 'axios'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore'
import { firestore } from '@/assets/firebase'

export interface EventRecord {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  volunteers: string
}

export interface EventPayload {
  title: string
  date: string
  time: string
  location: string
  description: string
  volunteers: string
}

const isProduction = import.meta.env.VITE_ENVIRONMENT === 'Production'
const API_URL = import.meta.env.VITE_API_URL;
const EVENTS_COLLECTION = 'events'

const normalizeEvent = (event: Partial<EventRecord> & { id: string | number }): EventRecord => ({
  id: String(event.id),
  title: event.title ?? '',
  date: event.date ?? '',
  time: event.time ?? '',
  location: event.location ?? '',
  description: event.description ?? '',
  volunteers: event.volunteers ?? ''
})

const sortEvents = (events: EventRecord[]) => {
  return [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}

const getFirestoreInstance = () => {
  if (!firestore) {
    throw new Error('Firestore is not configured for this environment.')
  }

  return firestore
}

const getBackendHeaders = () => {
  const token = localStorage.getItem('token')

  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
}

export const eventService = {
  async list(): Promise<EventRecord[]> {
    if (isProduction) {
      const db = getFirestoreInstance()
      const snapshot = await getDocs(collection(db, EVENTS_COLLECTION))

      return sortEvents(snapshot.docs.map((eventDoc) => normalizeEvent({
        id: eventDoc.id,
        ...eventDoc.data()
      } as Partial<EventRecord> & { id: string })))
    }

    const response = await axios.get(`${API_URL}/events`, {
      headers: getBackendHeaders()
    })

    const payload = Array.isArray(response.data?.data) ? response.data.data : []
    return sortEvents(payload.map((event: EventRecord) => normalizeEvent(event)))
  },

  async create(payload: EventPayload): Promise<EventRecord> {
    if (isProduction) {
      const db = getFirestoreInstance()
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), payload)
      return normalizeEvent({ id: docRef.id, ...payload })
    }

    const response = await axios.post(`${API_URL}/events`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeEvent(response.data?.data?.event)
  },

  async update(id: string, payload: EventPayload): Promise<EventRecord> {
    if (isProduction) {
      const db = getFirestoreInstance()
      await updateDoc(doc(db, EVENTS_COLLECTION, id), {
        title: payload.title,
        date: payload.date,
        time: payload.time,
        location: payload.location,
        description: payload.description,
        volunteers: payload.volunteers
      })
      return normalizeEvent({ id, ...payload })
    }

    const response = await axios.put(`${API_URL}/events/${id}`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeEvent(response.data?.data?.event)
  },

  async remove(id: string): Promise<void> {
    if (isProduction) {
      const db = getFirestoreInstance()
      await deleteDoc(doc(db, EVENTS_COLLECTION, id))
      return
    }

    await axios.delete(`${API_URL}/events/${id}`, {
      headers: getBackendHeaders()
    })
  }
}
