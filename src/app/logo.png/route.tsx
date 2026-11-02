/**
 * /logo.png — publisher logo for structured data.
 *
 * Google requires a resolvable raster logo on Article and Organization nodes
 * for rich results, so this must never 404. `articleSchema` / `organizationSchema`
 * prefer the Cloudinary logo from Settings and fall back here when it is unset.
 */
import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/firestore/settings'

export const runtime = 'nodejs'
export const revalidate = 86400

const SIZE = { width: 512, height: 512 }

export async function GET() {
  const s = await getSiteSettings()
  const siteTitle = s?.siteTitle || 'UpBeat Heart'

  return new ImageResponse(
    (
      <div
        style={{
          width: '512px',
          height: '512px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          background: 'linear-gradient(135deg,#0B2E63 0%,#1565D8 60%,#18B8E6 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: 120,
            background: 'rgba(255,255,255,0.14)',
            border: '6px solid rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#fff', fontSize: 140, fontWeight: 900, lineHeight: 1 }}>♥</span>
        </div>
        <span
          style={{
            color: '#fff',
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: -1,
            textAlign: 'center',
          }}
        >
          {siteTitle}
        </span>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
      },
    },
  )
}
