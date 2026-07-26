import { getAdminDb }        from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { NGO }          from '@/types/firestore'

/**
 * Public-safe fields only — NEVER sent to the browser:
 *   contactPerson, email, phone, documents[], photos[], meetingRequests[]
 *
 * logoUrl is the primary logo string URL — safe to expose.
 * photos[] are internal activity photos — NOT exposed.
 * documents[] are proof docs (reg cert, MoU) — NEVER exposed.
 */
const PUBLIC_FIELDS = new Set<string>([
  'name', 'description', 'website', 'logoUrl', 'address', 'status',
])

export async function getApprovedNGOs(): Promise<NGO[]> {
  try {
    const db = getAdminDb()

    // ⚠️  DO NOT add .orderBy('name') here.
    // Combining .where('status', 'in', [...]) with .orderBy() requires a
    // composite Firestore index. Without that index Firestore throws an error
    // that our catch swallows, returning [] and showing nothing on the website.
    // We sort alphabetically in JS instead — no index required.
    const snap = await db.collection('ngos')
      .where('status', 'in', ['approved', 'active'])
      .get()

    const ngos = snap.docs.map(d => {
      const raw  = d.data()
      const safe: Record<string, unknown> = { id: d.id }
      // Whitelist — only copy explicitly allowed public fields
      for (const key of PUBLIC_FIELDS) {
        if (key in raw) safe[key] = sanitizeForClient(raw[key])
      }
      // Result is guaranteed to NOT contain:
      // email, phone, contactPerson, documents, photos, meetingRequests
      return safe as unknown as NGO
    })

    // Sort A-Z by name in JS
    ngos.sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', 'en', { sensitivity: 'base' })
    )
    return ngos
  } catch (err) {
    console.error('[getApprovedNGOs] Firestore error:', err)
    return []
  }
}

/**
 * Server-side NGO registration — called from /api/ngo-register.
 * Uses Admin SDK so the client SDK is never imported in this server module.
 */
export async function registerNGOAdmin(data: {
  name:          string
  contactPerson: string
  email:         string
  phone:         string
  address:       string
  website:       string
  description:   string
  logoUrl?:      string
}): Promise<string> {
  const db  = getAdminDb()
  const ref = await db.collection('ngos').add({
    name:            data.name,
    contactPerson:   data.contactPerson,
    email:           data.email,
    phone:           data.phone,
    address:         data.address,
    website:         data.website,
    description:     data.description,
    status:          'pending',
    logoUrl:         data.logoUrl || null,
    photos:          [],
    documents:       [],
    meetingRequests: [],
    createdAt:       new Date().toISOString(),
  })
  return ref.id
}
