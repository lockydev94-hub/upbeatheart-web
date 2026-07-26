import { NextRequest, NextResponse } from 'next/server'
import { registerNGOAdmin } from '@/lib/firestore/ngos'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, contactPerson, email, phone, address, website, description, logoUrl } = body

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'name, email and phone are required' },
        { status: 400 },
      )
    }

    const id = await registerNGOAdmin({
      name:          name.trim(),
      contactPerson: (contactPerson ?? '').trim(),
      email:         email.trim(),
      phone:         phone.trim(),
      address:       (address ?? '').trim(),
      website:       (website ?? '').trim(),
      description:   (description ?? '').trim(),
      logoUrl:       typeof logoUrl === 'string' ? logoUrl.trim() : '',
    })

    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/ngo-register]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
