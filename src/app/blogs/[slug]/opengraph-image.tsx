import { ImageResponse } from 'next/og'
import { getBlogBySlug }  from '@/lib/firestore/blogs'
import { getSiteSettings } from '@/lib/firestore/settings'
import { stripHtml }      from '@/lib/seo'

export const runtime = 'nodejs'
export const revalidate = 3600

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function BlogOGImage({
  params,
}: {
  params: { slug: string }
}) {
  const [blog, settings] = await Promise.all([
    getBlogBySlug(params.slug),
    getSiteSettings(),
  ])

  const title       = blog?.title       ?? 'Heart Health Blog'
  const excerpt     = blog?.excerpt     ? stripHtml(blog.excerpt).slice(0, 140) : ''
  const category    = blog?.category    ?? 'Cardiology'
  const coverImage  = blog?.coverImage  ?? null
  const doctorName  = settings?.doctorName  ?? 'UpBeat Heart'
  const doctorTitle = settings?.doctorTitle ?? 'Cardiologist'
  const logoUrl     = settings?.logoUrl

  const publishedDate = blog?.publishedAt
    ? new Date(
        typeof blog.publishedAt === 'object' && blog.publishedAt?.toDate
          ? blog.publishedAt.toDate()
          : blog.publishedAt
      ).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          fontFamily: 'system-ui, sans-serif',
          background: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left accent bar */}
        <div style={{ width: 8, height: '100%', background: 'linear-gradient(to bottom, #1565D8, #18B8E6)', display: 'flex', flexShrink: 0 }} />

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 56px', position: 'relative' }}>
          {/* Top: site logo + category badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} width={40} height={40} alt="" style={{ borderRadius: 8, objectFit: 'contain' }} />
              )}
              <span style={{ color: '#143B7D', fontSize: 18, fontWeight: 800 }}>UpBeat Heart</span>
            </div>
            <span style={{ padding: '6px 18px', background: '#EBF2FF', borderRadius: 20, color: '#1565D8', fontSize: 14, fontWeight: 700 }}>
              {category}
            </span>
          </div>

          {/* Middle: title + excerpt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ color: '#0f2d6b', fontSize: title.length > 50 ? 40 : 50, fontWeight: 900, lineHeight: 1.15, letterSpacing: -1, maxWidth: coverImage ? 560 : 900 }}>
              {title}
            </div>
            {excerpt && (
              <div style={{ color: '#4B5563', fontSize: 20, lineHeight: 1.55, maxWidth: coverImage ? 540 : 860 }}>
                {excerpt}{excerpt.length === 140 ? '…' : ''}
              </div>
            )}
          </div>

          {/* Bottom: author + date */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg,#1565D8,#18B8E6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>♥</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#143B7D', fontSize: 15, fontWeight: 800 }}>{doctorName}</span>
                <span style={{ color: '#6B7280', fontSize: 13 }}>{doctorTitle}</span>
              </div>
            </div>
            {publishedDate && (
              <span style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500 }}>{publishedDate}</span>
            )}
          </div>
        </div>

        {/* Right: cover image */}
        {coverImage && (
          <div style={{ width: 380, display: 'flex', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #FFFFFF 0%, transparent 30%)', zIndex: 1, display: 'flex' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
