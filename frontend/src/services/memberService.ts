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

export interface MemberRecord {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'inactive'
  role: string
}

export interface MemberPayload {
  name: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'inactive'
  role: string
}

const isProduction = import.meta.env.VITE_ENVIRONMENT === 'Production'
const API_URL = import.meta.env.VITE_API_URL
const MEMBERS_COLLECTION = 'members'

const toMemberDocument = (payload: MemberPayload) => ({
  name: payload.name.trim(),
  email: payload.email.trim(),
  phone: payload.phone.trim(),
  joinDate: payload.joinDate,
  status: payload.status,
  role: payload.role.trim()
})

const normalizeMember = (member: Partial<MemberRecord> & { id: string | number }): MemberRecord => ({
  id: String(member.id),
  name: member.name ?? '',
  email: member.email ?? '',
  phone: member.phone ?? '',
  joinDate: member.joinDate ?? '',
  status: member.status ?? 'active',
  role: member.role ?? ''
})

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

export const memberService = {
  async list(): Promise<MemberRecord[]> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const snapshot = await getDocs(collection(db, MEMBERS_COLLECTION))

        return snapshot.docs
          .map((memberDoc) => normalizeMember({
            id: memberDoc.id,
            ...memberDoc.data()
          } as Partial<MemberRecord> & { id: string }))
          .sort((a, b) => a.name.localeCompare(b.name))
      } catch (error) {
        console.error('Firestore list error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to load members from Firestore')
      }
    }

    const response = await axios.get(`${API_URL}/members`, {
      headers: getBackendHeaders()
    })

    const payload = Array.isArray(response.data?.data) ? response.data.data : []
    return payload.map((member: MemberRecord) => normalizeMember(member))
  },

  async create(payload: MemberPayload): Promise<MemberRecord> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const memberData = toMemberDocument(payload)
        const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), memberData)
        return normalizeMember({ id: docRef.id, ...memberData })
      } catch (error) {
        console.error('Firestore create error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to create member in Firestore')
      }
    }

    const response = await axios.post(`${API_URL}/members`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeMember(response.data?.data?.member)
  },

  async update(id: string, payload: MemberPayload): Promise<MemberRecord> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const memberData = toMemberDocument(payload)
        await updateDoc(doc(db, MEMBERS_COLLECTION, id), {
          name: memberData.name,
          email: memberData.email,
          phone: memberData.phone,
          joinDate: memberData.joinDate,
          status: memberData.status,
          role: memberData.role
        })
        return normalizeMember({ id, ...memberData })
      } catch (error) {
        console.error('Firestore update error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to update member in Firestore')
      }
    }

    const response = await axios.put(`${API_URL}/members/${id}`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeMember(response.data?.data?.member)
  },

  async remove(id: string): Promise<void> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        await deleteDoc(doc(db, MEMBERS_COLLECTION, id))
        return
      } catch (error) {
        console.error('Firestore delete error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to delete member from Firestore')
      }
    }

    await axios.delete(`${API_URL}/members/${id}`, {
      headers: getBackendHeaders()
    })
  }
}
