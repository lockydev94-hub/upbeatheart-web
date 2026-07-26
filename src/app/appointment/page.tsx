/**
 * /appointment — SSR page
 * Fetches settings + doctor list server-side, renders the smart booking form client-side.
 */
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/firestore/settings'
import { getAdminDb }      from '@/lib/firebase-admin'
import AppointmentClient   from './_AppointmentClient'

export const revalidate = 120

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    title:       `Book Appointment | ${s.siteTitle}`,
    description: `Schedule your cardiology consultation with ${s.doctorName || 'Dr.'}, ${s.doctorTitle}. Quick, secure, online booking.`,
    openGraph: {
      title:       `Book Appointment | ${s.siteTitle}`,
      description: `Schedule your cardiology consultation online.`,
      images: s.ogImageUrl ? [s.ogImageUrl] : [],
    },
  }
}

export interface DoctorOption {
  uid:          string
  name:         string
  designation?: string
  photoURL?:    string
}

async function getDoctors(): Promise<DoctorOption[]> {
  try {
    const db   = getAdminDb()
    const snap = await db.collection('users').where('role', '==', 'doctor').get()
    return snap.docs.map(d => {
      const data = d.data()
      return { uid: d.id, name: data.name || '', designation: data.designation, photoURL: data.photoURL }
    }).filter(d => d.name).sort((a, b) => a.name.localeCompare(b.name))
  } catch { return [] }
}

export default async function AppointmentPage() {
  const [settings, doctors] = await Promise.all([getSiteSettings(), getDoctors()])
  return <AppointmentClient settings={settings} doctors={doctors} />
}
