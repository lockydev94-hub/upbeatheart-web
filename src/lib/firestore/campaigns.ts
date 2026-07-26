import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { Campaign } from '@/types/firestore'

export async function getPublishedCampaigns(limitCount = 20): Promise<Campaign[]> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('campaigns')
      .where('status', 'in', ['published', 'active'])
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()
    return snap.docs.map(d => ({ id: d.id, ...(sanitizeForClient(d.data()) as Record<string,unknown>) } as Campaign))
  } catch { return [] }
}

/** Fetch by Firestore doc ID */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('campaigns').doc(id).get()
    if (!snap.exists) return null
    const raw = snap.data()!
    if (!['published', 'active'].includes(raw.status)) return null
    const safe = sanitizeForClient(raw) as Record<string, unknown>
    delete safe.medicalDocs          // never expose to public website
    return { id: snap.id, ...safe } as Campaign
  } catch { return null }
}

/** Fetch by slug field (SEO-friendly URLs) — falls back to ID lookup */
export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  try {
    const db = getAdminDb()
    // Try slug first
    const bySlug = await db.collection('campaigns')
      .where('slug', '==', slug)
      .where('status', 'in', ['published', 'active'])
      .limit(1)
      .get()
    if (!bySlug.empty) {
      const snap = bySlug.docs[0]
      const safe = sanitizeForClient(snap.data()) as Record<string, unknown>
      delete safe.medicalDocs
      return { id: snap.id, ...safe } as Campaign
    }
    // Fallback: treat slug as Firestore doc ID (handles existing direct-ID links)
    return getCampaignById(slug)
  } catch { return null }
}
