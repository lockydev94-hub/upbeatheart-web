import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { Disease } from '@/types/firestore'

export async function getPublishedDiseases(limitCount = 50): Promise<Disease[]> {
  try {
    const db = getAdminDb()
    // No orderBy — avoids composite index requirement and empty results when publishedAt missing
    const snap = await db.collection('diseases')
      .where('status', '==', 'published')
      .limit(limitCount)
      .get()
    return snap.docs.map(d => ({ id: d.id, ...(sanitizeForClient(d.data()) as Record<string,unknown>) } as Disease))
  } catch (e) {
    console.error('[diseases] getPublishedDiseases error:', e)
    return []
  }
}

export async function getDiseaseBySlug(slug: string): Promise<Disease | null> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('diseases')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()
    if (snap.empty) return null
    return { id: snap.docs[0].id, ...(sanitizeForClient(snap.docs[0].data()) as Record<string,unknown>) } as Disease
  } catch { return null }
}

export async function getAllDiseaseSlugs(): Promise<string[]> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('diseases')
      .where('status', '==', 'published')
      .select('slug')
      .get()
    return snap.docs.map(d => d.data().slug as string).filter(Boolean)
  } catch { return [] }
}

export async function getAllDiseaseSlugsWithDates(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('diseases')
      .where('status', '==', 'published')
      .select('slug', 'updatedAt', 'publishedAt')
      .get()
    return snap.docs.map(d => {
      const data = d.data()
      const date = data.updatedAt?.toDate?.()?.toISOString()
        || data.publishedAt?.toDate?.()?.toISOString()
        || undefined
      return { slug: data.slug as string, updatedAt: date }
    }).filter(r => r.slug)
  } catch { return [] }
}
