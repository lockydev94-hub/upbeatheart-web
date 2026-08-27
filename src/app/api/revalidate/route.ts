/**
 * POST /api/revalidate
 *
 * Called by the admin dashboard immediately after saving site settings /
 * content. Busts the Next.js unstable_cache entries tagged 'settings' and
 * 'content' so every page re-fetches from Firestore on the next request.
 *
 * Security: requires the Firebase ID token of an admin/doctor user —
 * no shared secret is shipped in the admin bundle anymore.
 *   Header: Authorization: Bearer <Firebase ID token>
 *
 * Usage from admin dashboard:
 *   const token = await getIdToken()
 *   await fetch('https://upbeatheart.com/api/revalidate', {
 *     method: 'POST',
 *     headers: { Authorization: `Bearer ${token}` },
 *   })
 */

import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const user = await verifyAdminToken(req.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Bust the settings + content cache tags ────────────────────────────────
  revalidateTag('settings')
  revalidateTag('content')

  return NextResponse.json({
    revalidated: true,
    tag: 'settings, content',
    timestamp: new Date().toISOString(),
  })
}