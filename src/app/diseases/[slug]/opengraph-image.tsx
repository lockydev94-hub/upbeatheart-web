import { ImageResponse } from 'next/og'
import { getDiseaseBySlug } from '@/lib/firestore/diseases'
import { getSiteSettings }  from '@/lib/firestore/settings'
import { stripHtml }        from '@/lib/seo'

export const runtime = 'nodejs'
export const revalidate = 3600

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function DiseaseOGImage({
  params,
}: {
  params: { slug: string }
}) {
  const [disease, settings] = await Promise.all([
    getDiseaseBySlug(params.slug),
    getSiteSettings(),
  ])

  const title       = disease?.title ?? 'Heart Disease Guide'
  const overview    = disease ? stripHtml(disease.overview ?? '').slice(0, 140) : ''
  const doctorName  = settings?.doctorName  ?? 'UpBeat Heart'
  const doctorTitle = settings?.doctorTitle ?? 'Cardiologist'
  const logoUrl     = settings?.logoUrl
  const imgUrl      = typeof disease?.coverImage === 'object' && disease?.coverImage
    ? (disease.coverImage as { url: string }).url
    : typeof disease?.coverImage === 'string'
      ? disease.coverImage
      : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #0f2d6b 0%, #1565D8 55%, #18B8E6 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(24,181,90,0.12)', display: 'flex' }} />

        {/* Left content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px', zIndex: 1 }}>
          {/* Top: logo + site name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} width={44} height={44} alt="" style={{ borderRadius: 8, objectFit: 'contain' }} />
            )}
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: 700 }}>UpBeat Heart</span>
            <span style={{ marginLeft: 8, padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>Cardiology</span>
          </div>

          {/* Middle: title + overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 40, background: '#18B8E6', borderRadius: 4, display: 'flex' }} />
              <span style={{ color: '#18B8E6', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Disease Guide</span>
            </div>
            <div style={{ color: '#FFFFFF', fontSize: title.length > 30 ? 46 : 54, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1 }}>
              {title}
            </div>
            {overview && (
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 20, lineHeight: 1.5, maxWidth: 560 }}>
                {overview}{overview.length === 140 ? '…' : ''}
              </div>
            )}
          </div>

          {/* Bottom: doctor credit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>♥</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>Reviewed by {doctorName}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{doctorTitle}</span>
            </div>
          </div>
        </div>

        {/* Right: cover image (if any) */}
        {imgUrl && (
          <div style={{ width: 340, display: 'flex', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #1565D8 0%, transparent 40%)', zIndex: 1, display: 'flex' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
