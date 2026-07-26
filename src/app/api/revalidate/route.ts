/**
 * POST /api/revalidate
 *
 * Called by the admin dashboard immediately after saving site settings.
 * Busts the Next.js unstable_cache entry tagged 'settings' so every page
 * that calls getSiteSettings() re-fetches from Firestore on the next request.
 *
 * Security: requires a shared secret in the Authorization header.
 *   Header: Authorization: Bearer <REVALIDATE_SECRET>
 *   Set REVALIDATE_SECRET in .env.local and on the VPS.
 *
 * Usage from admin dashboard (after successful Firestore save):
 *   await fetch('https://upbeatheart.com/api/revalidate', {
 *     method: 'POST',
 *     headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}` },
 *   })
 */

import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const secret = process.env.REVALIDATE_SECRET
  const auth   = req.headers.get('authorization') ?? ''
  const token  = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Bust the settings cache tag ───────────────────────────────────────────
  revalidateTag('settings')

  return NextResponse.json({
    revalidated: true,
    tag: 'settings',
    timestamp: new Date().toISOString(),
  })
}
