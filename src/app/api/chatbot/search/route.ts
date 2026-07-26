/**
 * GET /api/chatbot/search
 *
 * Query params:
 *   q      – free-text search query (searches title + excerpt of blogs + diseases)
 *   type   – 'blogs' | 'diseases'  (list mode, no query needed)
 *   limit  – max results (default 6)
 *
 * Returns:
 *   { results: Array<{ title, excerpt, slug, type }> }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeForClient } from '@/lib/sanitize'

/** Strip all HTML tags and decode common HTML entities */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')          // remove all tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')              // collapse whitespace
    .trim()
}

interface SearchResult {
  title:   string
  excerpt: string
  slug:    string
  type:    'disease' | 'blog'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q     = (searchParams.get('q') || '').trim().toLowerCase()
  const type  = searchParams.get('type') || 'all'
  const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10), 20)

  try {
    const db = getAdminDb()

    // ── Fetch diseases ──
    let diseases: SearchResult[] = []
    if (type !== 'blogs') {
      const snap = await db.collection('diseases')
        .where('status', '==', 'published')
        .limit(50)
        .get()
      diseases = snap.docs
        .map(d => {
          const data = sanitizeForClient(d.data()) as Record<string, string>
          return {
            title:   String(data.title   || ''),
            excerpt: stripHtml(String(data.overview || data.tagline || '')).slice(0, 120),
            slug:    String(data.slug    || d.id),
            type:    'disease' as const,
          }
        })
        .filter(r => r.title && r.slug)
    }

    // ── Fetch blogs ──
    let blogs: SearchResult[] = []
    if (type !== 'diseases') {
      const snap = await db.collection('blogs')
        .where('status', '==', 'published')
        .limit(50)
        .get()
      blogs = snap.docs
        .map(d => {
          const data = sanitizeForClient(d.data()) as Record<string, string>
          return {
            title:   String(data.title   || ''),
            excerpt: stripHtml(String(data.excerpt || '')).slice(0, 120),
            slug:    String(data.slug    || d.id),
            type:    'blog' as const,
          }
        })
        .filter(r => r.title && r.slug)
    }

    let combined = [...diseases, ...blogs]

    // ── If free-text query, score and filter ──
    if (q) {
      const terms = q.split(/\s+/).filter(Boolean)

      const scored = combined.map(r => {
        const haystack = `${r.title} ${r.excerpt}`.toLowerCase()
        let score = 0
        for (const t of terms) {
          if (r.title.toLowerCase().includes(t)) score += 3
          if (haystack.includes(t)) score += 1
        }
        return { ...r, score }
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)

      combined = scored.map(({ score: _s, ...r }) => r as SearchResult)
    }

    const results = combined.slice(0, limit)

    return NextResponse.json({ results }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[chatbot/search] error:', err)
    return NextResponse.json({ results: [] })
  }
}
