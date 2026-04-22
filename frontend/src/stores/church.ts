import { defineStore } from 'pinia'
import { eventService, type EventPayload, type EventRecord } from '@/services/eventService'
import {
  bibleService,
  type BibleVerseFilters,
  type BibleVersePayload,
  type BibleVerseRecord
} from '@/services/bibleService'
import {
  volunteerService,
  type VolunteerPayload,
  type VolunteerRecord
} from '@/services/volunteerService'
import { memberService, type MemberPayload, type MemberRecord } from '@/services/memberService'

export interface Member extends MemberRecord {}

export interface Event extends EventRecord {}
export interface Volunteer extends VolunteerRecord {}
export interface BibleVerse extends BibleVerseRecord {}

export interface Donation {
  id: number
  donor: string
  amount: number
  date: string
  purpose: string
}

interface ChurchState {
  members: Member[]
  events: Event[]
  volunteers: Volunteer[]
  donations: Donation[]
  bibleVerses: BibleVerse[]
  membersLoading: boolean
  membersLoaded: boolean
  membersError: string | null
  eventsLoading: boolean
  eventsLoaded: boolean
  eventsError: string | null
  volunteersLoading: boolean
  volunteersLoaded: boolean
  volunteersError: string | null
  bibleVersesLoading: boolean
  bibleVersesLoaded: boolean
  bibleVersesError: string | null
  bibleVerseFilterSignature: string | null
}

export const useChurchStore = defineStore('church', {
  state: (): ChurchState => ({
    members: [],
    events: [],
    volunteers: [],
    donations: [
      {
        id: 1,
        donor: 'Anonymous',
        amount: 5000,
        date: '2024-12-01',
        purpose: 'Building Fund'
      },
      {
        id: 2,
        donor: 'Johnson Family',
        amount: 2500,
        date: '2024-12-03',
        purpose: 'Missions'
      },
      {
        id: 3,
        donor: 'Grace Ministries',
        amount: 10000,
        date: '2024-12-05',
        purpose: 'Outreach Program'
      },
      {
        id: 4,
        donor: 'William & Mary Smith',
        amount: 1500,
        date: '2024-12-07',
        purpose: 'Worship Ministry'
      },
      {
        id: 5,
        donor: 'Hope Fellowship',
        amount: 3000,
        date: '2024-12-10',
        purpose: 'Building Fund'
      }
    ],
    bibleVerses: [],
    membersLoading: false,
    membersLoaded: false,
    membersError: null,
    eventsLoading: false,
    eventsLoaded: false,
    eventsError: null,
    volunteersLoading: false,
    volunteersLoaded: false,
    volunteersError: null,
    bibleVersesLoading: false,
    bibleVersesLoaded: false,
    bibleVersesError: null,
    bibleVerseFilterSignature: null
  }),

  getters: {
    totalMembers: (state) => state.members.length,
    activeMembers: (state) => state.members.filter((member) => member.status === 'active').length,
    upcomingEvents: (state) => {
      const today = new Date().toLocaleDateString('en-CA')
      return [...state.events]
        .filter((event) => event.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 3)
    },
    totalDonations: (state) => state.donations.reduce((sum, donation) => sum + donation.amount, 0),
    buildingFundTotal: (state) => state.donations
      .filter((donation) => donation.purpose === 'Building Fund')
      .reduce((sum, donation) => sum + donation.amount, 0),
    recentDonations: (state) => state.donations.slice(0, 5),
    totalBibleVerses: (state) => state.bibleVerses.length
  },

  actions: {
    async loadMembers(force = false) {
      if (this.membersLoading || (this.membersLoaded && !force)) {
        return
      }

      this.membersLoading = true
      this.membersError = null

      try {
        this.members = await memberService.list()
        this.membersLoaded = true
      } catch (error) {
        this.membersError = error instanceof Error ? error.message : 'Failed to load members'
        throw error
      } finally {
        this.membersLoading = false
      }
    },

    async addMember(member: MemberPayload) {
      this.membersError = null

      try {
        const createdMember = await memberService.create(member)
        this.members.push(createdMember)
        this.sortMembers()
        return createdMember
      } catch (error) {
        this.membersError = error instanceof Error ? error.message : 'Failed to create member'
        throw error
      }
    },

    async updateMember(id: string, payload: MemberPayload) {
      this.membersError = null

      try {
        const updatedMember = await memberService.update(id, payload)
        const index = this.members.findIndex((member) => member.id === id)

        if (index >= 0) {
          this.members[index] = updatedMember
        } else {
          this.members.push(updatedMember)
        }

        this.sortMembers()
        return updatedMember
      } catch (error) {
        this.membersError = error instanceof Error ? error.message : 'Failed to update member'
        throw error
      }
    },

    async deleteMember(id: string) {
      this.membersError = null

      try {
        await memberService.remove(id)
        this.members = this.members.filter((member) => member.id !== id)
      } catch (error) {
        this.membersError = error instanceof Error ? error.message : 'Failed to delete member'
        throw error
      }
    },

    async loadEvents(force = false) {
      if (this.eventsLoading || (this.eventsLoaded && !force)) {
        return
      }

      this.eventsLoading = true
      this.eventsError = null

      try {
        this.events = await eventService.list()
        this.eventsLoaded = true
      } catch (error) {
        this.eventsError = error instanceof Error ? error.message : 'Failed to load events'
        throw error
      } finally {
        this.eventsLoading = false
      }
    },

    async createEvent(payload: EventPayload) {
      this.eventsError = null

      try {
        const createdEvent = await eventService.create(payload)
        this.events.push(createdEvent)
        this.sortEvents()
        return createdEvent
      } catch (error) {
        this.eventsError = error instanceof Error ? error.message : 'Failed to create event'
        throw error
      }
    },

    async updateEvent(id: string, payload: EventPayload) {
      this.eventsError = null

      try {
        const updatedEvent = await eventService.update(id, payload)
        const index = this.events.findIndex((event) => event.id === id)

        if (index >= 0) {
          this.events[index] = updatedEvent
        } else {
          this.events.push(updatedEvent)
        }

        this.sortEvents()
        return updatedEvent
      } catch (error) {
        this.eventsError = error instanceof Error ? error.message : 'Failed to update event'
        throw error
      }
    },

    async deleteEvent(id: string) {
      this.eventsError = null

      try {
        await eventService.remove(id)
        this.events = this.events.filter((event) => event.id !== id)
      } catch (error) {
        this.eventsError = error instanceof Error ? error.message : 'Failed to delete event'
        throw error
      }
    },

    async loadVolunteers(force = false) {
      if (this.volunteersLoading || (this.volunteersLoaded && !force)) {
        return
      }

      this.volunteersLoading = true
      this.volunteersError = null

      try {
        this.volunteers = await volunteerService.list()
        this.volunteersLoaded = true
        this.sortVolunteers()
      } catch (error) {
        this.volunteersError = error instanceof Error ? error.message : 'Failed to load volunteers'
        throw error
      } finally {
        this.volunteersLoading = false
      }
    },

    async loadBibleVerses(force = false, filters: BibleVerseFilters = {}) {
      const signature = JSON.stringify(filters)

      if (this.bibleVersesLoading || (this.bibleVersesLoaded && !force && this.bibleVerseFilterSignature === signature)) {
        return
      }

      this.bibleVersesLoading = true
      this.bibleVersesError = null

      try {
        this.bibleVerses = await bibleService.list(filters)
        this.bibleVersesLoaded = true
        this.bibleVerseFilterSignature = signature
        this.sortBibleVerses()
      } catch (error) {
        this.bibleVersesError = error instanceof Error ? error.message : 'Failed to load bible verses'
        throw error
      } finally {
        this.bibleVersesLoading = false
      }
    },

    async createBibleVerse(payload: BibleVersePayload) {
      this.bibleVersesError = null

      try {
        const createdVerse = await bibleService.create(payload)
        this.bibleVerses.push(createdVerse)
        this.sortBibleVerses()
        return createdVerse
      } catch (error) {
        this.bibleVersesError = error instanceof Error ? error.message : 'Failed to create bible verse'
        throw error
      }
    },

    async updateBibleVerse(id: string, payload: BibleVersePayload) {
      this.bibleVersesError = null

      try {
        const updatedVerse = await bibleService.update(id, payload)
        const index = this.bibleVerses.findIndex((verse) => verse.id === id)

        if (index >= 0) {
          this.bibleVerses[index] = updatedVerse
        } else {
          this.bibleVerses.push(updatedVerse)
        }

        this.sortBibleVerses()
        return updatedVerse
      } catch (error) {
        this.bibleVersesError = error instanceof Error ? error.message : 'Failed to update bible verse'
        throw error
      }
    },

    async deleteBibleVerse(id: string) {
      this.bibleVersesError = null

      try {
        await bibleService.remove(id)
        this.bibleVerses = this.bibleVerses.filter((verse) => verse.id !== id)
      } catch (error) {
        this.bibleVersesError = error instanceof Error ? error.message : 'Failed to delete bible verse'
        throw error
      }
    },

    async createVolunteer(payload: VolunteerPayload) {
      this.volunteersError = null

      try {
        const createdVolunteer = await volunteerService.create(payload)
        this.volunteers.push(createdVolunteer)
        this.sortVolunteers()
        return createdVolunteer
      } catch (error) {
        this.volunteersError = error instanceof Error ? error.message : 'Failed to create volunteer'
        throw error
      }
    },

    async updateVolunteer(id: string, payload: VolunteerPayload) {
      this.volunteersError = null

      try {
        const updatedVolunteer = await volunteerService.update(id, payload)
        const index = this.volunteers.findIndex((volunteer) => volunteer.id === id)

        if (index >= 0) {
          this.volunteers[index] = updatedVolunteer
        } else {
          this.volunteers.push(updatedVolunteer)
        }

        this.sortVolunteers()
        return updatedVolunteer
      } catch (error) {
        this.volunteersError = error instanceof Error ? error.message : 'Failed to update volunteer'
        throw error
      }
    },

    async deleteVolunteer(id: string) {
      this.volunteersError = null

      try {
        await volunteerService.remove(id)
        this.volunteers = this.volunteers.filter((volunteer) => volunteer.id !== id)
      } catch (error) {
        this.volunteersError = error instanceof Error ? error.message : 'Failed to delete volunteer'
        throw error
      }
    },

    addDonation(donation: Omit<Donation, 'id'>) {
      const newId = Math.max(...this.donations.map((item) => item.id)) + 1
      this.donations.push({ ...donation, id: newId })
    },

    sortEvents() {
      this.events = [...this.events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    },

    sortVolunteers() {
      this.volunteers = [...this.volunteers].sort((a, b) => a.name.localeCompare(b.name))
    },

    sortMembers() {
      this.members = [...this.members].sort((a, b) => a.name.localeCompare(b.name))
    },

    sortBibleVerses() {
      this.bibleVerses = [...this.bibleVerses].sort((a, b) => {
        return a.translation.localeCompare(b.translation)
          || a.testament.localeCompare(b.testament)
          || a.book.localeCompare(b.book)
          || a.chapter - b.chapter
          || a.verse - b.verse
      })
    }
  }
})
