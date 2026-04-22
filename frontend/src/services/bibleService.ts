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

export interface BibleVerseRecord {
  id: string
  translation: string
  testament: 'Old Testament' | 'New Testament'
  book: string
  chapter: number
  verse: number
  text: string
  reference: string
  created_at?: string
  updated_at?: string
}

export interface BibleVersePayload {
  translation: string
  testament: 'Old Testament' | 'New Testament'
  book: string
  chapter: number
  verse: number
  text: string
}

export interface BibleVerseFilters {
  translation?: string
  testament?: string
  book?: string
  chapter?: number | null
  search?: string
}

const API_URL = import.meta.env.VITE_API_URL
const isProduction = import.meta.env.VITE_ENVIRONMENT === 'Production'
const BIBLE_COLLECTION = 'bibleVerses'

const getBackendHeaders = () => {
  const token = localStorage.getItem('token')

  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
}

const getFirestoreInstance = () => {
  if (!firestore) {
    throw new Error('Firestore is not configured for this environment.')
  }

  return firestore
}

const normalizeBibleVerse = (
  verse: Partial<BibleVerseRecord> & { id: string | number }
): BibleVerseRecord => ({
  id: String(verse.id),
  translation: verse.translation ?? 'TB',
  testament: (verse.testament as BibleVerseRecord['testament']) ?? 'Old Testament',
  book: verse.book ?? '',
  chapter: Number(verse.chapter ?? 0),
  verse: Number(verse.verse ?? 0),
  text: verse.text ?? '',
  reference: verse.reference ?? `${verse.book ?? ''} ${verse.chapter ?? ''}:${verse.verse ?? ''}`.trim(),
  created_at: verse.created_at,
  updated_at: verse.updated_at
})

const sortVerses = (verses: BibleVerseRecord[]) => {
  return [...verses].sort((a, b) => {
    return a.translation.localeCompare(b.translation)
      || a.testament.localeCompare(b.testament)
      || a.book.localeCompare(b.book)
      || a.chapter - b.chapter
      || a.verse - b.verse
  })
}

export const bibleService = {
  async list(filters: BibleVerseFilters = {}): Promise<BibleVerseRecord[]> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const snapshot = await getDocs(collection(db, BIBLE_COLLECTION))
        const normalized = sortVerses(snapshot.docs.map((verseDoc) => normalizeBibleVerse({
          id: verseDoc.id,
          ...verseDoc.data()
        } as Partial<BibleVerseRecord> & { id: string })))

        return normalized.filter((verse) => {
          const translationMatch = !filters.translation || verse.translation.toLowerCase() === filters.translation.toLowerCase()
          const testamentMatch = !filters.testament || verse.testament === filters.testament
          const bookMatch = !filters.book || verse.book.toLowerCase().includes(filters.book.toLowerCase())
          const chapterMatch = !filters.chapter || verse.chapter === filters.chapter
          const searchText = filters.search?.trim().toLowerCase() ?? ''
          const searchMatch = !searchText || verse.text.toLowerCase().includes(searchText) || verse.reference.toLowerCase().includes(searchText)

          return translationMatch && testamentMatch && bookMatch && chapterMatch && searchMatch
        })
      } catch (error) {
        console.error('Firestore list error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to load bible verses from Firestore')
      }
    }

    const response = await axios.get(`${API_URL}/bible`, {
      params: {
        translation: filters.translation || undefined,
        testament: filters.testament || undefined,
        book: filters.book || undefined,
        chapter: filters.chapter || undefined,
        search: filters.search || undefined
      },
      headers: getBackendHeaders()
    })

    const payload = Array.isArray(response.data?.data) ? response.data.data : []
    return sortVerses(payload.map((verse: BibleVerseRecord) => normalizeBibleVerse(verse)))
  },

  async create(payload: BibleVersePayload): Promise<BibleVerseRecord> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const verseData = {
          translation: payload.translation.trim() || 'TB',
          testament: payload.testament,
          book: payload.book.trim(),
          chapter: payload.chapter,
          verse: payload.verse,
          text: payload.text.trim(),
          reference: `${payload.book.trim()} ${payload.chapter}:${payload.verse}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const docRef = await addDoc(collection(db, BIBLE_COLLECTION), verseData)
        return normalizeBibleVerse({ id: docRef.id, ...verseData })
      } catch (error) {
        console.error('Firestore create error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to create bible verse in Firestore')
      }
    }

    const response = await axios.post(`${API_URL}/bible`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeBibleVerse(response.data?.data?.verse)
  },

  async update(id: string, payload: BibleVersePayload): Promise<BibleVerseRecord> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        const verseData = {
          translation: payload.translation.trim() || 'TB',
          testament: payload.testament,
          book: payload.book.trim(),
          chapter: payload.chapter,
          verse: payload.verse,
          text: payload.text.trim(),
          reference: `${payload.book.trim()} ${payload.chapter}:${payload.verse}`,
          updatedAt: new Date().toISOString()
        }

        await updateDoc(doc(db, BIBLE_COLLECTION, id), verseData)
        return normalizeBibleVerse({ id, ...verseData })
      } catch (error) {
        console.error('Firestore update error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to update bible verse in Firestore')
      }
    }

    const response = await axios.put(`${API_URL}/bible/${id}`, payload, {
      headers: getBackendHeaders()
    })

    return normalizeBibleVerse(response.data?.data?.verse)
  },

  async remove(id: string): Promise<void> {
    if (isProduction) {
      try {
        const db = getFirestoreInstance()
        await deleteDoc(doc(db, BIBLE_COLLECTION, id))
        return
      } catch (error) {
        console.error('Firestore delete error:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to delete bible verse from Firestore')
      }
    }

    await axios.delete(`${API_URL}/bible/${id}`, {
      headers: getBackendHeaders()
    })
  }
}
