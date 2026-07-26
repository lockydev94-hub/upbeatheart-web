import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * GET /api/appointment/check-phone?phone=7008691022
 *
 * Uses Firebase Admin SDK (server-side) — bypasses Firestore security rules
 * entirely. This is the correct approach for a public phone lookup:
 *   • No auth required from the client
 *   • Admin SDK has full read access regardless of rules
 *   • Only returns first name + visit count — zero PII exposed
 */
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')?.trim()

  if (!phone || phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ exists: false })
  }

  try {
    const db = getAdminDb()

    const snap = await db
      .collection('appointments')
      .where('patientPhone', '==', phone)
      .limit(20)
      .get()

    if (snap.empty) {
      return NextResponse.json({ exists: false })
    }

    // Sort client-side — handles both Firestore Timestamp AND ISO string createdAt
    const docs = snap.docs
      .map(d => d.data())
      .sort((a, b) => {
        const toMs = (v: any): number => {
          if (!v) return 0
          if (v instanceof Timestamp) return v.toMillis()
          if (typeof v === 'string') return new Date(v).getTime()
          if (typeof v.toMillis === 'function') return v.toMillis()
          return 0
        }
        return toMs(b.createdAt) - toMs(a.createdAt)
      })

    // Return ONLY first name + visit count — never PII
    const firstName = (docs[0].patientName || '').split(' ')[0]
    const visitCount = docs.length

    return NextResponse.json({ exists: true, firstName, visitCount })
  } catch (err) {
    console.error('[check-phone] error:', err)
    // Return 200 with exists:false so client can still proceed as new patient
    return NextResponse.json({ exists: false, error: 'lookup_failed' })
  }
}
