import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const SUBJECTS: Record<string, string> = {
  appointment: 'Appointment Enquiry',
  report:      'Report / Second Opinion',
  assistance:  'Patient Assistance',
  ngo:         'NGO Partnership',
  other:       'Other',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, subject, message } = body

    // Validate required fields
    if (!name?.trim())    return NextResponse.json({ error: 'Name is required' },    { status: 400 })
    if (!phone?.trim())   return NextResponse.json({ error: 'Phone is required' },   { status: 400 })
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    const db = getAdminDb()
    const ref = await db.collection('contacts').add({
      name:        name.trim(),
      phone:       phone.trim(),
      email:       (email ?? '').trim(),
      subject:     subject ? (SUBJECTS[subject] ?? subject) : '',
      subjectKey:  subject ?? '',
      message:     message.trim(),
      status:      'new',       // new | read | replied | archived
      replyNote:   '',
      createdAt:   FieldValue.serverTimestamp(),
      updatedAt:   FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ id: ref.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
