import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb }                from '@/lib/firebase-admin'
import { FieldValue }                from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientName, rating, text, photoURL } = body

    // ── Validation ──────────────────────────────────────────────────
    if (!patientName?.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 })
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }
    if (!text?.trim() || text.trim().length < 10) {
      return NextResponse.json({ error: 'Review text must be at least 10 characters' }, { status: 400 })
    }

    // ── Write to Firestore via Admin SDK (bypasses security rules) ───
    const db  = getAdminDb()
    const ref = await db.collection('reviews').add({
      patientName: patientName.trim(),
      rating:      Number(rating),
      text:        text.trim(),
      photoURL:    typeof photoURL === 'string' && photoURL.trim() ? photoURL.trim() : null,
      videoURL:    null,
      source:      'manual',
      status:      'pending',
      createdAt:   FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ id: ref.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/review-submit]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
