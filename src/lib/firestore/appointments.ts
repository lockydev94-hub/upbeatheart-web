'use client'
import { db } from '@/lib/firebase-client'
import {
  collection, addDoc, serverTimestamp,
} from 'firebase/firestore'
import type { Appointment } from '@/types/firestore'

/**
 * Check if a patient exists by phone.
 *
 * Calls the Next.js server-side API route /api/appointment/check-phone
 * which uses the Firebase Admin SDK — bypasses Firestore security rules
 * entirely so this works without any auth, regardless of deployed rules.
 *
 * Returns only: { exists, firstName, visitCount } — never PII.
 */
export async function checkPatientByPhone(
  phone: string
): Promise<{ exists: boolean; firstName?: string; visitCount?: number }> {
  const res = await fetch(
    `/api/appointment/check-phone?phone=${encodeURIComponent(phone.trim())}`,
    { method: 'GET', cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`check-phone failed: ${res.status}`)
  return res.json()
}

/**
 * Create a new appointment and trigger an FCM push notification
 * to the assigned doctor via the VPS notification server.
 *
 * The VPS notification server (Firestore onSnapshot listener) fires
 * automatically when the appointment doc is created. No extra work needed —
 * we just write to Firestore and the server handles FCM delivery.
 */
export async function createAppointment(
  data: Omit<Appointment, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'appointments'), {
    ...data,
    status:        'pending',
    paymentStatus: 'unpaid',
    source:        'website',   // track booking origin
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/** Generate a display booking reference (UBH-XXXXXX) from a Firestore doc ID */
export function generateBookingRef(docId: string): string {
  return 'UBH-' + docId.slice(-6).toUpperCase()
}

export const APPOINTMENT_REASONS = [
  'Chest Pain / Discomfort',
  'Shortness of Breath',
  'Heart Palpitations',
  'High Blood Pressure',
  'Follow-up Consultation',
  'ECG / Echo Review',
  'Pre-operative Cardiac Clearance',
  'Second Opinion',
  'Routine Heart Check-up',
  'Other',
]

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM',
]
