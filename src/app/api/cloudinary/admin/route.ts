/**
 * POST /api/cloudinary/admin
 *
 * Server-side proxy for the Cloudinary Admin API (list + delete assets).
 * The admin dashboard used to embed the Cloudinary API secret in its
 * browser bundle to call api.cloudinary.com directly — this route moves
 * that credential to the server.
 *
 * Auth: Firebase ID token of an 'admin' user (see lib/admin-auth).
 *   Header: Authorization: Bearer <ID token>
 *
 * Body: { action: 'list',   resourceType: 'image'|'video', nextCursor?: string }
 *    or { action: 'delete', resourceType: 'image'|'video', publicIds: string[] }
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, isAdminRole } from '@/lib/admin-auth'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY    = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

const cloudinaryApi = async (path: string, init?: RequestInit): Promise<Response> => {
  return fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: 'Basic ' + Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64'),
    },
  })
}

export async function POST(req: NextRequest) {
  // ── CORS: allow the admin dashboard origin ──
  const allowedOrigin = process.env.ADMIN_APP_ORIGIN
  const origin = req.headers.get('origin')
  const corsHeaders: Record<string, string> = { 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
  if (allowedOrigin && origin && origin === allowedOrigin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
  }

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
  }

  try {
    const user = await verifyAdminToken(req.headers.get('authorization'))
    if (!isAdminRole(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { action, resourceType, nextCursor, publicIds } = body

    if (action === 'list') {
      const params = new URLSearchParams({ max_results: '100' })
      if (nextCursor) params.set('next_cursor', nextCursor)
      const res = await cloudinaryApi(`/resources/${resourceType === 'video' ? 'video' : 'image'}?${params}`)
      const data = await res.json()
      if (!res.ok) {
        return NextResponse.json({ error: data?.error?.message ?? `HTTP ${res.status}` }, { status: res.status, headers: corsHeaders })
      }
      return NextResponse.json(data, { headers: corsHeaders })
    }

    if (action === 'delete') {
      if (!Array.isArray(publicIds) || publicIds.length === 0) {
        return NextResponse.json({ error: 'publicIds is required' }, { status: 400, headers: corsHeaders })
      }
      const res = await cloudinaryApi(`/resources/${resourceType === 'video' ? 'video' : 'image'}/upload`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_ids: publicIds }),
      })
      const data = await res.json()
      if (!res.ok) {
        return NextResponse.json({ error: data?.error?.message ?? `HTTP ${res.status}` }, { status: res.status, headers: corsHeaders })
      }
      return NextResponse.json(data, { headers: corsHeaders })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: corsHeaders })
  } catch (err: any) {
    console.error('[POST /api/cloudinary/admin]', err?.message ?? err)
    return NextResponse.json({ error: 'Cloudinary admin request failed' }, { status: 500, headers: corsHeaders })
  }
}
