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

export type VolunteerServiceName =
  | 'Musician'
  | 'Soundman'
  | 'Multimedia'
  | 'Streaming'
  | 'Worship Committee'

export interface VolunteerRecord {
  id: string
  name: string
  service: VolunteerServiceName
  skills: string[]
  contact: string
}

export interface VolunteerPayload {
  name: string
  service: VolunteerServiceName
  skills: string[]
  contact: string
}

const isProduction = import.meta.env.VITE_ENVIRONMENT === 'Production'
const API_URL = import.meta.env.VITE_API_URL;
const VOLUNTEERS_COLLECTION = 'volunteers'

const normalizeVolunteer = (
  volunteer: Partial<VolunteerRecord> & { id: string | number }
): VolunteerRecord => ({
  id: String(volunteer.id),
  name: volunteer.name ?? '',
  service: (volunteer.service ?? 'Musician') as VolunteerServiceName,
  skills: Array.isArray(volunteer.skills)
    ? volunteer.skills
      .map((skill) => String(skill).trim())
      .filter(Boolean)
    : [],
  contact: volunteer.contact ?? ''
})

const sortVolunteers = (volunteers: VolunteerRecord[]) => {
  return [...volunteers].sort((a, b) => a.name.localeCompare(b.name))
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

export const volunteerService = {
  async list(): Promise<VolunteerRecord[]> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const snapshot = await getDocs(collection(db, VOLUNTEERS_COLLECTION))

        return sortVolunteers(snapshot.docs.map((volunteerDoc) => normalizeVolunteer({
          id: volunteerDoc.id,
          ...volunteerDoc.data()
        } as Partial<VolunteerRecord> & { id: string })))
      } catch (error) {
        console.error('Firestore list error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to load volunteers from Firestore')
      }
    }

    const response = await axios.get(`${API_URL}/volunteers`, {
      headers: getBackendHeaders()
    })

    const payload = Array.isArray(response.data?.data) ? response.data.data : []
    return sortVolunteers(payload.map((volunteer: VolunteerRecord) => normalizeVolunteer(volunteer)))
  },

  async create(payload: VolunteerPayload): Promise<VolunteerRecord> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const docRef = await addDoc(collection(db, VOLUNTEERS_COLLECTION), {
          ...payload,
          createdAt: new Date().toISOString()
        })
        return normalizeVolunteer({ id: docRef.id, ...payload })
      } catch (error) {
        console.error('Firestore create error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to create volunteer in Firestore')
      }
    }

    const response = await axios.post(`${API_URL}/volunteers`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeVolunteer(response.data?.data?.volunteer)
  },

  async update(id: string, payload: VolunteerPayload): Promise<VolunteerRecord> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        await updateDoc(doc(db, VOLUNTEERS_COLLECTION, id), {
          name: payload.name,
          service: payload.service,
          skills: payload.service === 'Worship Committee' ? [] : payload.skills,
          contact: payload.contact
        })
        return normalizeVolunteer({ id, ...payload })
      } catch (error) {
        console.error('Firestore update error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to update volunteer in Firestore')
      }
    }

    const response = await axios.put(`${API_URL}/volunteers/${id}`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeVolunteer(response.data?.data?.volunteer)
  },

  async remove(id: string): Promise<void> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        await deleteDoc(doc(db, VOLUNTEERS_COLLECTION, id))
        return
      } catch (error) {
        console.error('Firestore delete error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to delete volunteer from Firestore')
      }
    }

    await axios.delete(`${API_URL}/volunteers/${id}`, {
      headers: getBackendHeaders()
    })
  }
}
