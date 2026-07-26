import { getAdminDb }        from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { GalleryItem }  from '@/types/firestore'

function toItem(d: FirebaseFirestore.QueryDocumentSnapshot): GalleryItem {
  return { id: d.id, ...(sanitizeForClient(d.data()) as Record<string, unknown>) } as GalleryItem
}

async function queryGallery(limit?: number): Promise<GalleryItem[]> {
  const db = getAdminDb()
  try {
    let q = db.collection('gallery').where('status', '==', 'published').orderBy('createdAt', 'desc')
    const snap = limit ? await q.limit(limit).get() : await q.get()
    console.log(`[gallery] fetched ${snap.size} published items (ordered)`)
    return snap.docs.map(toItem)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('index') || msg.includes('FAILED_PRECONDITION')) {
      console.warn('[gallery] ⚠️  Missing composite index (status + createdAt). Falling back to unordered query…')
      const match = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
      if (match) console.warn('  Create index →', match[0])
    } else {
      console.error('[gallery] Firestore error:', msg)
    }
    try {
      const snap = await db.collection('gallery').where('status', '==', 'published').get()
      const docs = snap.docs.map(toItem)
      console.log(`[gallery] fallback fetched ${docs.length} items (unordered)`)
      return limit ? docs.slice(0, limit) : docs
    } catch (err2) {
      console.error('[gallery] fallback failed:', err2)
      return []
    }
  }
}

/** Home section preview — max 9 items */
export async function getPublishedGallery(limit = 9): Promise<GalleryItem[]> {
  return queryGallery(limit)
}

/** Full gallery page — all published */
export async function getAllPublishedGallery(): Promise<GalleryItem[]> {
  return queryGallery()
}
