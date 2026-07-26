'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Images, Play, ArrowRight, X,
  ChevronLeft, ChevronRight, ZoomIn, Video,
  Camera, ExternalLink,
} from 'lucide-react'
import type { GalleryItem } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'

// ── Category label map ──────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = {
  clinic:      'Clinic',
  health_camp: 'Health Camp',
  community:   'Community',
  awards:      'Awards',
  events:      'Events',
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
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
    if (e.key === 'ArrowLeft'  && hasPrev) onGoto(index - 1)
    if (e.key === 'ArrowRight' && hasNext) onGoto(index + 1)
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
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col"
      onClick={onClose}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left: icon + title + meta */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)' }}
          >
            {item.type === 'video'
              ? <Video  size={15} className="text-white" />
              : <Camera size={15} className="text-white" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold line-clamp-1 leading-tight">
              {item.caption || 'Gallery'}
            </p>
            <p className="text-white/60 text-[11px] capitalize mt-0.5">
              {CAT_LABELS[item.category] ?? item.category} &middot; {index + 1} of {items.length}
            </p>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            title="Open original"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.32)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.28)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)' }}
          >
            <ExternalLink size={15} />
          </a>

          {/* Close — red background, full opacity, unmistakable */}
          <button
            onClick={onClose}
            aria-label="Close gallery"
            title="Close (Esc)"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-200"
            style={{
              background: 'rgba(220,38,38,0.90)',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(185,28,28,0.98)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.90)' }}
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Media area ── */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0 px-14 py-6"
        onClick={onClose}
      >
        <div
          className="max-w-5xl w-full max-h-full flex items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          {item.type === 'video' ? (
            <video
              key={item.id}
              src={item.url}
              controls
              autoPlay
              className="max-h-[65vh] w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <div className="relative max-h-[65vh] max-w-full w-full flex items-center justify-center" style={{ minHeight: '200px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={item.id}
                src={item.url}
                alt={item.caption}
                className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl"
                style={{ display: 'block' }}
              />
            </div>
          )}
        </div>

        {/* Prev nav */}
        {hasPrev && (
          <button
            onClick={e => { e.stopPropagation(); onGoto(index - 1) }}
            aria-label="Previous image"
            className="absolute left-3 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.32)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)' }}
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {/* Next nav */}
        {hasNext && (
          <button
            onClick={e => { e.stopPropagation(); onGoto(index + 1) }}
            aria-label="Next image"
            className="absolute right-3 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.32)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)' }}
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* ── Filmstrip ── */}
      <div
        className="shrink-0 px-4 py-3 overflow-x-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex gap-2 w-max mx-auto">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => onGoto(i)}
              className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                i === index
                  ? 'ring-2 ring-[#18B8E6] ring-offset-2 ring-offset-black scale-110 z-10 opacity-100'
                  : 'opacity-45 hover:opacity-75'
              }`}
            >
              {it.type === 'video' ? (
                <div className="w-full h-full bg-[#1565D8]/60 flex items-center justify-center">
                  <Play size={14} className="fill-white text-white" />
                </div>
              ) : (
                <LazyImage
                  src={it.url}
                  alt=""
                  revealBlur
                  className="w-full h-full object-cover"
                />
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
  onClick:     () => void
  aspectClass: string
  className?:  string
}

function GalleryCard({ item, onClick, aspectClass, className = '' }: CardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-[#143B7D]/10 w-full ${aspectClass} ${className}`}
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
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#143B7D] to-[#1565D8] flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Play size={24} className="fill-white text-white ml-1" />
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Video badge */}
      {item.type === 'video' && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          <Play size={9} className="fill-white" /> Video
        </div>
      )}

      {/* Category badge — visible on hover */}
      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {CAT_LABELS[item.category] ?? item.category}
      </div>

      {/* Caption + zoom icon */}
      <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-end justify-between w-full gap-2">
          {item.caption && (
            <p className="text-white text-xs font-medium leading-snug line-clamp-2 flex-1">
              {item.caption}
            </p>
          )}
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            {item.type === 'video'
              ? <Play size={13} className="fill-white text-white" />
              : <ZoomIn size={13} className="text-white" />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton placeholder ──────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl bg-[#DCE3EC]/60 animate-pulse aspect-[4/3] ${
            i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2 md:aspect-auto md:min-h-[320px]' : ''
          }`}
        />
      ))}
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
interface Props { items: GalleryItem[] }

export default function GallerySection({ items }: Props) {
  const isLive      = items.length > 0
  const display     = isLive ? items.slice(0, 9) : []
  const totalItems  = items.length

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const [big, med1, med2, sm1, sm2, sm3, ...extra] = display

  return (
    <>
      <section
        ref={sectionRef}
        className="py-16 md:py-24 bg-[#F8FAFC] overflow-hidden"
      >
        <div className="container-max px-4 md:px-8">

          {/* ── Section header ── */}
          <div
            className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateY(24px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1565D8]/8 border border-[#1565D8]/15 text-[#1565D8] text-[11px] font-bold uppercase tracking-widest mb-4">
                <Images size={11} />
                Our Gallery
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#143B7D] leading-tight tracking-tight">
                Moments That{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'var(--gradient-primary)' }}
                >
                  Matter
                </span>
              </h2>
              <p className="text-[#6B7280] text-base mt-2 leading-relaxed max-w-lg">
                A glimpse into our clinic, health camps, community outreach, and the moments we cherish.
              </p>
            </div>

            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#143B7D] transition-colors shadow-md shadow-[#1565D8]/20 shrink-0"
            >
              View Gallery <ArrowRight size={15} />
            </Link>
          </div>

          {/* ── Grid ── */}
          {!isLive ? (
            <SkeletonGrid />
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'none' : 'translateY(32px)',
                transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
              }}
            >
              {big && (
                <div className="col-span-2 md:col-span-1 md:row-span-2">
                  <GalleryCard item={big}  onClick={() => setLightboxIndex(0)} aspectClass="aspect-[4/3]" className="md:aspect-auto md:h-full" />
                </div>
              )}
              {med1 && <GalleryCard item={med1} onClick={() => setLightboxIndex(1)} aspectClass="aspect-[4/3]" />}
              {med2 && <GalleryCard item={med2} onClick={() => setLightboxIndex(2)} aspectClass="aspect-[4/3]" />}
              {sm1  && <GalleryCard item={sm1}  onClick={() => setLightboxIndex(3)} aspectClass="aspect-[4/3]" />}
              {sm2  && <GalleryCard item={sm2}  onClick={() => setLightboxIndex(4)} aspectClass="aspect-[4/3]" />}
              {sm3  && <GalleryCard item={sm3}  onClick={() => setLightboxIndex(5)} aspectClass="aspect-[4/3]" />}
              {extra.slice(0, 3).map((item, i) => (
                <GalleryCard key={item.id} item={item} onClick={() => setLightboxIndex(6 + i)} aspectClass="aspect-[4/3]" />
              ))}
            </div>
          )}

          {/* ── Bottom CTA strip ── */}
          {isLive && (
            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DCE3EC] shadow-sm"
              style={{
                opacity:    visible ? 1 : 0,
                transition: 'opacity 0.7s ease 0.35s',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1565D8]/10 flex items-center justify-center">
                  <Images size={18} className="text-[#1565D8]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#143B7D]">
                    {totalItems}+ Photos &amp; Videos
                  </p>
                  <p className="text-xs text-[#6B7280]">From our clinic, health camps &amp; community events</p>
                </div>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#1565D8] text-[#1565D8] text-sm font-semibold hover:bg-[#1565D8] hover:text-white transition-colors"
              >
                View All Gallery <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && isLive && (
        <Lightbox
          items={display}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onGoto={setLightboxIndex}
        />
      )}
    </>
  )
}
