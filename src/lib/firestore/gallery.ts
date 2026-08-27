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
    return snap.docs.map(toItem)
  } catch {
    // Fallback: no orderBy — works without a composite index
    try {
      const snap = await db.collection('gallery').where('status', '==', 'published').get()
      const docs = snap.docs.map(toItem)
      return limit ? docs.slice(0, limit) : docs
    } catch {
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
