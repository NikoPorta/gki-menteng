import { defineStore } from 'pinia'

export interface Member {
  id: number
  name: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'inactive'
  role: string
}

export interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  description: string
  attendees: number
}

export interface Donation {
  id: number
  donor: string
  amount: number
  date: string
  purpose: string
}

export const useChurchStore = defineStore('church', {
  state: () => ({
    members: [
      {
        id: 1,
        name: 'Rev. Dr. Michael Johnson',
        email: 'pastor.michael@church.org',
        phone: '+1 (555) 123-4567',
        joinDate: '2020-01-15',
        status: 'active',
        role: 'Lead Pastor'
      },
      {
        id: 2,
        name: 'Sarah Williams',
        email: 'sarah.williams@church.org',
        phone: '+1 (555) 234-5678',
        joinDate: '2021-03-20',
        status: 'active',
        role: 'Worship Leader'
      },
      {
        id: 3,
        name: 'David Thompson',
        email: 'david.thompson@church.org',
        phone: '+1 (555) 345-6789',
        joinDate: '2019-06-10',
        status: 'active',
        role: 'Elder'
      },
      {
        id: 4,
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@church.org',
        phone: '+1 (555) 456-7890',
        joinDate: '2022-01-05',
        status: 'inactive',
        role: 'Volunteer'
      },
      {
        id: 5,
        name: 'James Anderson',
        email: 'james.anderson@church.org',
        phone: '+1 (555) 567-8901',
        joinDate: '2018-11-12',
        status: 'active',
        role: 'Deacon'
      }
    ] as Member[],
    
    events: [
      {
        id: 1,
        title: 'Sunday Morning Worship',
        date: '2024-12-15',
        time: '10:00 AM',
        location: 'Main Sanctuary',
        description: 'Join us for a powerful worship experience',
        attendees: 245
      },
      {
        id: 2,
        title: 'Bible Study Group',
        date: '2024-12-16',
        time: '7:00 PM',
        location: 'Fellowship Hall',
        description: 'Deep dive into the Book of Psalms',
        attendees: 89
      },
      {
        id: 3,
        title: 'Youth Ministry Meeting',
        date: '2024-12-17',
        time: '6:30 PM',
        location: 'Youth Center',
        description: 'Activities and fellowship for teens',
        attendees: 56
      },
      {
        id: 4,
        title: 'Prayer Vigil',
        date: '2024-12-18',
        time: '8:00 PM',
        location: 'Prayer Room',
        description: 'Night of prayer and intercession',
        attendees: 34
      }
    ] as Event[],
    
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
    ] as Donation[]
  }),
  
  getters: {
    totalMembers: (state) => state.members.length,
    activeMembers: (state) => state.members.filter(m => m.status === 'active').length,
    upcomingEvents: (state) => state.events.slice(0, 3),
    totalDonations: (state) => state.donations.reduce((sum, d) => sum + d.amount, 0),
    buildingFundTotal: (state) => state.donations
      .filter(d => d.purpose === 'Building Fund')
      .reduce((sum, d) => sum + d.amount, 0),
    recentDonations: (state) => state.donations.slice(0, 5)
  },
  
  actions: {
    addMember(member: Omit<Member, 'id'>) {
      const newId = Math.max(...this.members.map(m => m.id)) + 1
      this.members.push({ ...member, id: newId })
    },
    
    addEvent(event: Omit<Event, 'id'>) {
      const newId = Math.max(...this.events.map(e => e.id)) + 1
      this.events.push({ ...event, id: newId })
    },
    
    addDonation(donation: Omit<Donation, 'id'>) {
      const newId = Math.max(...this.donations.map(d => d.id)) + 1
      this.donations.push({ ...donation, id: newId })
    }
  }
})