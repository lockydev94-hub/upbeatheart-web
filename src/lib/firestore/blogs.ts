import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'
import type { Blog } from '@/types/firestore'

export async function getPublishedBlogs(limitCount = 20): Promise<Blog[]> {
  try {
    const db = getAdminDb()
    // NOTE: Order only by status (no orderBy on publishedAt) so that blogs
    // manually published without a publishedAt field are NOT silently excluded
    // by Firestore (it drops docs missing the orderBy field from results).
    // We sort client-side after fetching.
    const snap = await db.collection('blogs')
      .where('status', '==', 'published')
      .limit(limitCount)
      .get()

    const blogs = snap.docs.map(d => ({
      id: d.id,
      ...(sanitizeForClient(d.data()) as Record<string, unknown>),
    } as Blog))

    // Sort newest-first: prefer publishedAt, fall back to createdAt, then id
    blogs.sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
      return tb - ta
    })

    return blogs
  } catch (err) {
    console.error('[getPublishedBlogs] error:', err)
    return []
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const db = getAdminDb()
    // Query by slug only (no status filter) so manually published blogs
    // without the exact status string still resolve — then gate on status below.
    const snap = await db.collection('blogs')
      .where('slug', '==', slug)
      .limit(1)
      .get()
    if (snap.empty) return null
    const blog = {
      id: snap.docs[0].id,
      ...(sanitizeForClient(snap.docs[0].data()) as Record<string, unknown>),
    } as Blog
    // Only serve published blogs on the website
    if (blog.status !== 'published') return null
    return blog
  } catch (err) {
    console.error('[getBlogBySlug] error:', err)
    return null
  }
}

export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('blogs')
      .where('status', '==', 'published')
      .select('slug')
      .get()
    return snap.docs.map(d => d.data().slug as string).filter(Boolean)
  } catch (err) {
    console.error('[getAllBlogSlugs] error:', err)
    return []
  }
}

export async function getAllBlogSlugsWithDates(): Promise<{ slug: string; publishedAt?: string }[]> {
  try {
    const db = getAdminDb()
    const snap = await db.collection('blogs')
      .where('status', '==', 'published')
      .select('slug', 'publishedAt', 'updatedAt')
      .get()
    return snap.docs.map(d => {
      const data = d.data()
      const date = data.publishedAt?.toDate?.()?.toISOString()
        || data.updatedAt?.toDate?.()?.toISOString()
        || undefined
      return { slug: data.slug as string, publishedAt: date }
    }).filter(r => r.slug)
  } catch { return [] }
}
