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
    console.log(`[reviews] fetched ${snap.size} published reviews (ordered)`)
    return snap.docs.map(toReview)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // Firestore index missing → the error message contains a console link to create it
    if (msg.includes('index') || msg.includes('FAILED_PRECONDITION')) {
      console.warn('[reviews] ⚠️  Missing Firestore composite index for reviews (status + createdAt).')
      console.warn('[reviews] Deploy firestore.indexes.json, or create the index here:')
      // Extract the direct link Firestore provides in the error message
      const match = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
      if (match) console.warn('  →', match[0])
      console.warn('[reviews] Falling back to unordered query…')
    } else {
      console.error('[reviews] Firestore error:', msg)
    }
    // Fallback: no orderBy — works without any index
    try {
      const snap = await db.collection('reviews').where('status', '==', 'published').get()
      console.log(`[reviews] fallback fetched ${snap.size} published reviews (unordered)`)
      // Sort in memory by createdAt descending
      const docs = snap.docs.map(toReview)
      docs.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt as string).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt as string).getTime() : 0
        return tb - ta
      })
      return limit ? docs.slice(0, limit) : docs
    } catch (err2) {
      console.error('[reviews] fallback also failed:', err2)
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

/** Debug: log all docs in reviews collection (no index needed) */
export async function debugCountAllReviews(): Promise<void> {
  try {
    const db   = getAdminDb()
    const snap = await db.collection('reviews').get()
    console.log(`[reviews DEBUG] collection has ${snap.size} total docs`)
    snap.docs.slice(0, 10).forEach(d => {
      const data = d.data()
      console.log(`  id=${d.id}  status=${data.status}  name=${data.patientName}  rating=${data.rating}`)
    })
  } catch (err) {
    console.error('[reviews DEBUG] failed:', err)
  }
}
