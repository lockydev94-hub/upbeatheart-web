import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { Campaign } from '@/types/firestore'

interface DocLike { id: string; data(): FirebaseFirestore.DocumentData | undefined }

function toCampaign(d: DocLike): Campaign {
  const safe = sanitizeForClient(d.data()) as Record<string, unknown>
  delete safe.medicalDocs          // never expose to public website
  return { id: d.id, ...safe } as Campaign
}

function sortNewestFirst(list: Campaign[]): Campaign[] {
  return list.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt as string).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt as string).getTime() : 0
    return tb - ta
  })
}

export async function getPublishedCampaigns(limitCount = 20): Promise<Campaign[]> {
  const db = getAdminDb()
  try {
    // Preferred: with orderBy (requires composite index on status + createdAt)
    const snap = await db.collection('campaigns')
      .where('status', 'in', ['published', 'active'])
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()
    return snap.docs.map(toCampaign)
  } catch {
    // Fallback: no orderBy — works without a composite index.
    // If the index is missing, the published/active campaigns section
    // must NOT silently vanish.
    try {
      const snap = await db.collection('campaigns')
        .where('status', 'in', ['published', 'active'])
        .limit(limitCount)
        .get()
      return sortNewestFirst(snap.docs.map(toCampaign))
    } catch {
      return []
    }
  }
}

/** Fetch by Firestore doc ID */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('campaigns').doc(id).get()
    if (!snap.exists) return null
    const raw = snap.data()!
    if (!['published', 'active'].includes(raw.status)) return null
    return toCampaign(snap)
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
    if (!bySlug.empty) return toCampaign(bySlug.docs[0])
    // Fallback: treat slug as Firestore doc ID (handles existing direct-ID links)
    return getCampaignById(slug)
  } catch { return null }
}
