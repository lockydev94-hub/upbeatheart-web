'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Images, Play, X, ChevronLeft, ChevronRight,
  ZoomIn, Video, ImageIcon, Download, ExternalLink,
  LayoutGrid, Search, Camera,
} from 'lucide-react'
import type { GalleryItem } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'all',         label: 'All',        icon: '🖼️' },
  { value: 'clinic',      label: 'Clinic',      icon: '🏥' },
  { value: 'health_camp', label: 'Health Camp', icon: '⛺' },
  { value: 'community',   label: 'Community',   icon: '🤝' },
  { value: 'awards',      label: 'Awards',      icon: '🏆' },
  { value: 'events',      label: 'Events',      icon: '🎉' },
] as const

// Every tile is 4:3 because the admin dashboard crops gallery photos to
// 800×600 (4:3) and promises "Gallery photos must be 4:3 landscape so they
// display correctly in the website grid". A 3/2 slot here sliced 11% off the
// top and bottom of those photos.
const ASPECTS = [
  'aspect-[4/3]',
  'aspect-[4/3]',
  'aspect-[4/3]',
  'aspect-[4/3]',
  'aspect-[4/3]',
  'aspect-[4/3]',
]

// ── YouTube helper ────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
interface LightboxProps {
  items: GalleryItem[]
  index: number
  onClose: () => void
  onGoto: (i: number) => void
}

function Lightbox({ items, index, onClose, onGoto }: LightboxProps) {
  const item    = items[index]
  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape')                    onClose()
    if (e.key === 'ArrowLeft'  && hasPrev)     onGoto(index - 1)
    if (e.key === 'ArrowRight' && hasNext)     onGoto(index + 1)
  }, [index, hasPrev, hasNext, onClose, onGoto])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/98 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* ── Top bar ── */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            {item.type === 'video'
              ? <Video size={14} className="text-white" />
              : <Camera size={14} className="text-white" />
            }
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight line-clamp-1">
              {item.caption || 'Gallery'}
            </p>
            <p className="text-white/40 text-[11px] capitalize">
              {item.category?.replace('_', ' ')} · {index + 1} of {items.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition"
            title="Open original"
          >
            <ExternalLink size={15} />
          </a>
          {item.type === 'photo' && (
            <a
              href={item.url}
              download
              onClick={e => e.stopPropagation()}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition"
              title="Download"
            >
              <Download size={15} />
            </a>
          )}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* ── Media area ── */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0 px-16 py-6"
        onClick={onClose}
      >
        <div
          className="max-w-5xl w-full max-h-full flex items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          {item.type === 'video' ? (
            (() => {
              const ytId = getYouTubeId(item.url)
              return ytId ? (
                <div className="w-full aspect-video max-h-[65vh]">
                  <iframe
                    key={item.id}
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                    className="w-full h-full rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={item.caption}
                  />
                </div>
              ) : (
                <video
                  key={item.id}
                  src={item.url}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full rounded-2xl object-contain shadow-2xl"
                />
              )
            })()
          ) : (
            <div className="relative max-w-full w-full" style={{ minHeight: '200px', maxHeight: '65vh' }}>
              <LazyImage
                key={item.id}
                src={item.url}
                alt={item.caption}
                revealBlur
                rootMargin="0px"
                className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Nav buttons */}
        {hasPrev && (
          <button
            onClick={e => { e.stopPropagation(); onGoto(index - 1) }}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/10 flex items-center justify-center text-white transition"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {hasNext && (
          <button
            onClick={e => { e.stopPropagation(); onGoto(index + 1) }}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/10 flex items-center justify-center text-white transition"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* ── Filmstrip ── */}
      <div
        className="shrink-0 border-t border-white/10 px-4 py-3 overflow-x-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex gap-2 w-max mx-auto">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => onGoto(i)}
              className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                i === index
                  ? 'ring-2 ring-[#18B8E6] scale-110 z-10'
                  : 'opacity-40 hover:opacity-70'
              }`}
            >
              {it.type === 'video' ? (() => {
                const ytId = getYouTubeId(it.url)
                const thumb = ytId
                  ? `https://img.youtube.com/vi/${ytId}/default.jpg`
                  : it.thumbnailUrl || null
                return thumb ? (
                  <div className="relative w-full h-full">
                    <Image src={thumb} alt="" fill className="object-cover" sizes="56px" unoptimized={thumb.includes('img.youtube.com')} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play size={10} className="fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1565D8]/40 flex items-center justify-center">
                    <Play size={14} className="fill-white text-white" />
                  </div>
                )
              })() : (
                <LazyImage src={it.url} alt="" rootMargin="0px" className="absolute inset-0 w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Gallery card ──────────────────────────────────────────────────────────────
interface CardProps {
  item:        GalleryItem
  aspectClass: string
  onClick:     () => void
}

function GalleryCard({ item, aspectClass, onClick }: CardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-[#DCE3EC] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 break-inside-avoid mb-3 w-full ${aspectClass}`}
      onClick={onClick}
    >
      {item.type === 'photo' ? (
        <LazyImage
          src={item.url}
          alt={item.caption}
          revealBlur
          revealScale
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (() => {
        // FIX: show YouTube thumbnail, Cloudinary thumbnail, or fallback gradient
        const ytId = getYouTubeId(item.url)
        const thumbSrc = ytId
          ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
          : item.thumbnailUrl || null

        return thumbSrc ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={thumbSrc}
              alt={item.caption}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={thumbSrc.includes('img.youtube.com')}
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 ${ytId ? 'bg-red-600' : 'bg-black/60'}`}>
                <Play size={24} className="fill-white text-white ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#143B7D] to-[#1565D8] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play size={28} className="fill-white text-white ml-1" />
            </div>
          </div>
        )
      })()}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Video badge */}
      {item.type === 'video' && (
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          <Play size={8} className="fill-white" /> Video
        </div>
      )}

      {/* Hover: action icon + caption */}
      <div className="absolute inset-0 flex flex-col items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {item.type === 'video'
            ? <Play size={13} className="fill-white text-white" />
            : <ZoomIn size={13} className="text-white" />
          }
        </div>
        {item.caption && (
          <p className="text-white text-xs font-medium leading-snug line-clamp-2 w-full text-left">
            {item.caption}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Category filter pill ──────────────────────────────────────────────────────
interface CatPillProps {
  cat:    typeof CATEGORIES[number]
  active: boolean
  count:  number
  onClick: () => void
}

function CatPill({ cat, active, count, onClick }: CatPillProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-[#1565D8] text-white shadow-sm'
          : 'bg-[#F8FAFC] text-[#6B7280] border border-[#DCE3EC] hover:border-[#1565D8]/30 hover:text-[#1565D8]'
      }`}
    >
      <span>{cat.icon}</span>
      {cat.label}
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-[#DCE3EC] text-[#6B7280]'
      }`}>
        {count}
      </span>
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props {
  items:    GalleryItem[]
  settings: { siteTitle?: string; whatsapp?: string } | null
}

export default function GalleryClient({ items, settings }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch]                 = useState('')
  const [lightboxIndex, setLightboxIndex]   = useState<number | null>(null)

  const filtered = items.filter(it => {
    if (activeCategory !== 'all' && it.category !== activeCategory) return false
    if (search.trim() && !it.caption?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const photos = filtered.filter(i => i.type === 'photo').length
  const videos = filtered.filter(i => i.type === 'video').length

  // Category counts (based on all items, not filtered)
  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.value] = c.value === 'all'
      ? items.length
      : items.filter(i => i.category === c.value).length
    return acc
  }, {})

  const clearFilters = () => { setSearch(''); setActiveCategory('all') }

  return (
    <main className="bg-[#F8FAFC] min-h-screen">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#143B7D] via-[#1565D8] to-[#18B8E6] pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-[#18B55A]/10" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-[#18B8E6]/10" />
        </div>

        <div className="container-max px-4 md:px-8 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/60 text-xs mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">Gallery</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest mb-5">
                <Images size={10} /> Our Gallery
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
                Moments That<br />
                <span className="text-[#18B8E6]">Matter</span>
              </h1>
              <p className="text-white/75 text-lg leading-relaxed max-w-lg">
                A visual journey through our clinic, health camps, community events, and milestones.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 shrink-0">
              {[
                { value: `${items.length}+`, label: 'Items',  icon: <LayoutGrid size={16} /> },
                { value: `${items.filter(i => i.type === 'photo').length}`,  label: 'Photos', icon: <ImageIcon size={16} /> },
                { value: `${items.filter(i => i.type === 'video').length}`,  label: 'Videos', icon: <Video size={16} /> },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                    {s.icon}
                  </div>
                  <p className="text-white font-extrabold text-xl leading-none">{s.value}</p>
                  <p className="text-white/50 text-[10px] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STICKY FILTER BAR ═════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCE3EC] shadow-sm">
        <div className="container-max px-4 md:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 pb-0.5 scrollbar-hide">
            {CATEGORIES.filter(c => counts[c.value] > 0 || c.value === 'all').map(cat => (
              <CatPill
                key={cat.value}
                cat={cat}
                active={activeCategory === cat.value}
                count={counts[cat.value] ?? 0}
                onClick={() => setActiveCategory(cat.value)}
              />
            ))}
          </div>

          {/* Search */}
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search captions…"
              className="pl-8 pr-4 py-2 text-sm border border-[#DCE3EC] rounded-xl bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 w-44"
            />
          </div>
        </div>
      </div>

      {/* ══ MASONRY GALLERY GRID ══════════════════════════════════════════════ */}
      <section className="py-10 md:py-14">
        <div className="container-max px-4 md:px-8">

          {/* Result count + clear */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[#6B7280]">
              Showing <span className="font-bold text-[#143B7D]">{filtered.length}</span> items
              {photos > 0 && <> · <span className="text-[#1565D8] font-semibold">{photos} photos</span></>}
              {videos > 0 && <> · <span className="text-purple-600 font-semibold">{videos} videos</span></>}
            </p>
            {(search || activeCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#1565D8] hover:underline flex items-center gap-1"
              >
                <X size={11} /> Clear filters
              </button>
            )}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-[#DCE3EC] p-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#DCE3EC] flex items-center justify-center mx-auto mb-4">
                <Images size={28} className="text-[#DCE3EC]" />
              </div>
              <h3 className="text-lg font-bold text-[#143B7D] mb-2">No items found</h3>
              <p className="text-[#6B7280] text-sm">Try a different category or search term.</p>
              <button
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#143B7D] transition"
              >
                Show all items
              </button>
            </div>
          )}

          {/* Masonry grid — uses columns layout, height varied per item */}
          {filtered.length > 0 && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {filtered.map((item, idx) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  aspectClass={ASPECTS[idx % ASPECTS.length]}
                  onClick={() => setLightboxIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ BOTTOM CTA ════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#1565D8] via-[#18B8E6] to-[#18B55A] py-14">
        <div className="container-max px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Want to Experience This Care?
          </h2>
          <p className="text-white/80 text-base mb-7 max-w-lg mx-auto">
            Book your appointment and become a part of our growing family of healthy hearts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/appointment"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1565D8] text-sm font-bold hover:bg-[#F8FAFC] transition shadow-lg"
            >
              Book Appointment
            </Link>
            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white/50 text-white text-sm font-semibold hover:bg-white/10 transition"
              >
                WhatsApp Us
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ══ LIGHTBOX ══════════════════════════════════════════════════════════ */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onGoto={setLightboxIndex}
        />
      )}
    </main>
  )
}
