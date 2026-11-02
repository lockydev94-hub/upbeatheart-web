/**
 * /og-default.png — the site-wide social card.
 *
 * Generated rather than checked in, so it always reflects the current Settings
 * (site title, doctor name, logo). `buildMetadata` falls back to this URL when a
 * page has no image of its own and Settings has no OG image, so it must always
 * return a real 1200x630 PNG — a 404 here means every static page shares a
 * broken preview on WhatsApp, LinkedIn and X.
 */
import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/firestore/settings'

export const runtime = 'nodejs'
export const revalidate = 3600

const SIZE = { width: 1200, height: 630 }

export async function GET() {
  const s = await getSiteSettings()

  const siteTitle   = s?.siteTitle   || 'UpBeat Heart'
  const doctorName  = s?.doctorName  || ''
  const doctorTitle = s?.doctorTitle || 'Consultant Cardiologist'
  const tagline     = s?.siteDescription
    ? s.siteDescription.slice(0, 120)
    : 'Doctor-verified cardiac care, patient education and assistance.'
  const logoUrl     = s?.logoUrl || ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg,#0B2E63 0%,#143B7D 45%,#1565D8 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ECG line watermark */}
        <svg
          width="1200"
          height="200"
          viewBox="0 0 1200 200"
          style={{ position: 'absolute', left: 0, bottom: 0, opacity: 0.16 }}
        >
          <polyline
            points="0,100 180,100 220,30 250,170 285,30 320,170 360,100 560,100 600,30 630,170 665,30 700,170 740,100 1200,100"
            fill="none"
            stroke="#18B8E6"
            strokeWidth="6"
          />
        </svg>

        {/* Top: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              width={56}
              height={56}
              alt=""
              style={{ borderRadius: 12, objectFit: 'contain', background: '#fff' }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: 'linear-gradient(135deg,#18B8E6,#1565D8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>♥</span>
            </div>
          )}
          <span style={{ color: '#fff', fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
            {siteTitle}
          </span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 940 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '8px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: '#8FE3FF',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            CARDIOLOGY CARE
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: -1.5,
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Bottom: doctor + domain */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {doctorName && (
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{doctorName}</span>
            )}
            <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 19 }}>{doctorTitle}</span>
          </div>
          <span style={{ color: '#8FE3FF', fontSize: 20, fontWeight: 700 }}>
            upbeatheart.com
          </span>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
