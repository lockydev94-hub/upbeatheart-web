import { getAdminDb }        from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { Review }       from '@/types/firestore'

function toReview(d: FirebaseFirestore.QueryDocumentSnapshot): Review {
  return { id: d.id, ...(sanitizeForClient(d.data()) as Record<string, unknown>) } as Review
}

async function queryReviews(limit?: number): Promise<Review[]> {
  const db = getAdminDb()
  try {
    // Preferred: with orderBy (requires composite index on status + createdAt)
    let q = db.collection('reviews').where('status', '==', 'published').orderBy('createdAt', 'desc')
    const snap = limit ? await q.limit(limit).get() : await q.get()
    return snap.docs.map(toReview)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // Fallback: no orderBy — works without any index
    try {
      const snap = await db.collection('reviews').where('status', '==', 'published').get()
      // Sort in memory by createdAt descending
      const docs = snap.docs.map(toReview)
      docs.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt as string).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt as string).getTime() : 0
        return tb - ta
      })
      return limit ? docs.slice(0, limit) : docs
    } catch {
      // (err: unknown) → index-missing message contains the console link to create it;
      // both attempts failed — return empty rather than crash the page.
      return []
    }
  }
}

/** Home carousel — max 9 most recent */
export async function getPublishedReviews(limit = 9): Promise<Review[]> {
  return queryReviews(limit)
}

/** Reviews page — all published */
export async function getAllPublishedReviews(): Promise<Review[]> {
  return queryReviews()
}
