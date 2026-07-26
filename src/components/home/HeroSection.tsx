'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Calendar, ChevronRight, ChevronLeft,
  MapPin, Award, Stethoscope, Star,
  Shield, ArrowRight, Heart, Activity,
} from 'lucide-react'
import type { SiteSettings, Disease } from '@/types/firestore'
import { cloudinaryResize, cloudinaryPortrait } from '@/lib/cloudinary'
import LazyImage from '@/components/ui/LazyImage'

interface HeroSectionProps {
  settings: SiteSettings
  diseases: Disease[]
}

function getCoverUrl(coverImage: Disease['coverImage']): string {
  let raw = ''
  if (!coverImage) return ''
  if (typeof coverImage === 'string') raw = coverImage
  else if (typeof coverImage === 'object' && 'url' in coverImage) raw = coverImage.url ?? ''
  // 16:10 ratio matches the ~60% height of the 430px card (≈258px) at typical card widths
  return cloudinaryResize(raw, 800, 500, 'fill')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Heart Conditions':         { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400'    },
  'Arrhythmia':               { bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
  'Valvular Heart Disease':   { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400' },
  'Vascular Conditions':      { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400'   },
  'Congenital Heart Disease': { bg: 'bg-pink-50',    text: 'text-pink-700',   dot: 'bg-pink-400'   },
  'Lifestyle & Prevention':   { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-400'  },
  'Cardiac Investigations':   { bg: 'bg-cyan-50',    text: 'text-cyan-700',   dot: 'bg-cyan-400'   },
}
function catStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: 'bg-primary/8', text: 'text-primary', dot: 'bg-primary' }
}

/* ─────────────────────────────────────────────
   DISEASE SLIDE — fixed overflow, clean layout
───────────────────────────────────────────── */
function DiseaseSlide({ disease, active, direction }: {
  disease: Disease
  active: boolean
  direction: 'left' | 'right'
}) {
  const cs      = catStyle(disease.category)
  const imgUrl  = getCoverUrl(disease.coverImage)
  const altText = typeof disease.coverImage === 'object' && disease.coverImage && 'alt' in disease.coverImage
    ? (disease.coverImage.alt ?? disease.title)
    : disease.title
  const warnings = disease.earlyWarningSigns?.slice(0, 2) ?? []
  const overview = stripHtml(disease.overview).slice(0, 110)

  return (
    <Link
      href={`/diseases/${disease.slug}`}
      className={`absolute inset-0 transition-all duration-500 ease-in-out group block ${
        active          ? 'opacity-100 translate-x-0 z-10'
        : direction === 'right' ? 'opacity-0 translate-x-full z-0'
        :                          'opacity-0 -translate-x-full z-0'
      }`}
    >
      {/* ── Full-bleed hero image — 8:5 matches Cloudinary 800×500 crop, never cuts ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '8/5' }}>
        {imgUrl ? (
          <LazyImage
            src={imgUrl}
            alt={altText}
            revealBlur
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 gradient-primary flex items-center justify-center">
            <Heart size={48} className="text-white/20" fill="currentColor" />
          </div>
        )}
        {/* Dark gradient overlay so title is always readable */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(8,20,50,0.96) 0%, rgba(8,20,50,0.38) 48%, transparent 100%)' }}
        />

        {/* Category pill — top-left */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md ${cs.bg} ${cs.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cs.dot}`} />
            {disease.category}
          </span>
        </div>

        {/* Verified badge — top-right */}
        {disease.doctorVerified && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-green text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md backdrop-blur-md">
            <Shield size={9} />
            Verified
          </div>
        )}

        {/* Title + tagline anchored at image bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 pt-8">
          <h3 className="text-[16px] lg:text-[17px] font-extrabold text-white leading-tight tracking-tight line-clamp-2 drop-shadow">
            {disease.title}
          </h3>
          {disease.tagline && (
            <p className="text-[11px] text-white/60 font-medium mt-1 line-clamp-1">{disease.tagline}</p>
          )}
        </div>
      </div>

      {/* ── Info panel — 40% height of 480px card = 192px ── */}
      <div
        className="flex flex-col px-4 pt-3 pb-3"
        style={{ height: '40%' }}
      >
        {/* Warning signs / overview — scrolls content into 2 rows max */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {warnings.length > 0 ? (
            <>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-primary/40 mb-1.5">
                Key Warning Signs
              </p>
              <div className="flex flex-col gap-1">
                {warnings.map((w) => (
                  <div key={w} className="flex items-start gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-[3px] flex-shrink-0" />
                    <span className="text-[11px] text-text-secondary font-medium leading-snug line-clamp-1">{w}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
              {overview}{overview.length >= 110 ? '…' : ''}
            </p>
          )}
        </div>

        {/* ── Bottom row: risk pill + CTA  — flex-shrink-0 so it never gets pushed ── */}
        <div className="flex-shrink-0 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-2">

            {/* Risk factor — max 1 pill, hard truncate */}
            <div className="flex items-center gap-1 min-w-0 overflow-hidden" style={{ maxWidth: 'calc(100% - 96px)' }}>
              {disease.riskFactors?.slice(0, 1).map((rf) => (
                <span
                  key={rf}
                  className="text-[10px] px-2 py-0.5 bg-primary/6 text-primary/70 rounded-full border border-primary/12 font-semibold whitespace-nowrap truncate"
                  style={{ maxWidth: '100%' }}
                >
                  {rf}
                </span>
              ))}
              {(disease.riskFactors?.length ?? 0) > 1 && (
                <span className="text-[10px] px-2 py-0.5 bg-border/60 text-text-secondary/60 rounded-full font-semibold whitespace-nowrap flex-shrink-0">
                  +{(disease.riskFactors?.length ?? 0) - 1}
                </span>
              )}
            </div>

            {/* "View Details" CTA — flex-shrink-0, always visible */}
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-primary group-hover:gap-1.5 transition-all flex-shrink-0 whitespace-nowrap">
              View Details
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────
   ANIMATED BORDER RING — reusable component
   Same spinning gradient ring on BOTH cards
───────────────────────────────────────────── */
function AnimatedBorderRing({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute -inset-[2px] rounded-3xl pointer-events-none z-0 ${className}`}
      style={{
        background: 'conic-gradient(from var(--angle, 0deg), #1565D8, #18B8E6, #18B55A, #4F8FF5, #1565D8)',
        animation: 'spinBorder 4s linear infinite',
        opacity: 0.45,
      }}
    />
  )
}

/* ─────────────────────────────────────────────
   CONNECTING ARROW — points from doctor to slider
───────────────────────────────────────────── */
function ConnectingArrow() {
  return (
    <div
      className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center"
      style={{ width: 48, height: 48 }}
      aria-hidden
    >
      {/* Outer pulse ring */}
      <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
      {/* Inner circle */}
      <span className="relative w-9 h-9 rounded-full gradient-primary shadow-[0_0_16px_rgba(21,101,216,0.5)] flex items-center justify-center">
        <ArrowRight size={16} className="text-white" style={{ animation: 'arrowBounce 1.4s ease-in-out infinite' }} />
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN HERO SECTION
───────────────────────────────────────────── */
export default function HeroSection({ settings, diseases }: HeroSectionProps) {

  const [current, setCurrent]     = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [paused, setPaused]       = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = diseases.length

  const go = useCallback((idx: number, dir: 'left' | 'right') => {
    setDirection(dir)
    setCurrent((idx + total) % total)
  }, [total])

  const next = useCallback(() => go(current + 1, 'right'), [current, go])
  const prev = useCallback(() => go(current - 1, 'left'), [current, go])

  useEffect(() => {
    if (paused || total === 0) return
    timerRef.current = setInterval(next, 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, next, total])

  const waClean    = settings.whatsapp?.replace(/\D/g, '') ?? ''
  const phoneClean = settings.phone?.replace(/\D/g, '') ?? ''

  const doctorStats = [
    { icon: Award,       value: settings.doctorExperience ?? '15+', label: 'Years Exp.'    },
    { icon: Star,        value: '4.9★',                              label: 'Patient Rating' },
    { icon: Activity,    value: '10K+',                              label: 'Procedures'     },
    { icon: Stethoscope, value: '3+',                                label: 'Specialities'   },
  ]

  return (
    <section
      className="relative overflow-hidden bg-white"
      style={{ minHeight: 'calc(100vh - var(--header-h, 100px))' }}
    >

      {/* ── Background soft blobs + grid ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -left-32 -top-32 w-[520px] h-[520px] rounded-full bg-primary/4 blur-[90px]" />
        <div className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-cyan/5 blur-[70px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[560px] h-[260px] rounded-full bg-green/4 blur-[90px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.022]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0L0 0 0 48" fill="none" stroke="#1565D8" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>
      </div>

      <div className="container-max px-4 md:px-8 relative z-10 h-full">
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center py-8 lg:py-12 relative"
          style={{ minHeight: 'calc(100vh - var(--header-h, 100px))' }}
        >

          {/* Connecting arrow between the two columns */}
          <ConnectingArrow />

          {/* ══════════════════════════════════════════════
              LEFT — Doctor profile
              Entrance: fade + slide in from left
          ══════════════════════════════════════════════ */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeSlideLeft 0.65s cubic-bezier(0.22,1,0.36,1) both' }}
          >

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/4 text-primary text-[11px] font-bold uppercase tracking-[0.08em]">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Accepting Appointments
            </div>

            {/* ── Doctor card with animated spinning border ── */}
            <div className="relative">
              {/* Spinning gradient border ring */}
              <AnimatedBorderRing />
              {/* Card body sits on top */}
              <div className="relative rounded-3xl border border-border/40 bg-white shadow-[0_8px_40px_rgba(21,101,216,0.13)] overflow-hidden p-5 lg:p-6 z-10">

                {/* Top accent strip */}
                <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary" />

                <div className="flex gap-4 items-start">
                  {/* ── Glowing doctor photo ── */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-primary via-cyan to-green opacity-40 blur-md animate-pulse" />
                    <div className="relative w-28 h-36 lg:w-32 lg:h-[168px] rounded-2xl overflow-hidden border-2 border-white shadow-[0_0_0_2px_#1565D8,0_8px_32px_rgba(21,101,216,0.35)] z-10">
                      {settings.doctorPhotoUrl ? (
                        <LazyImage
                          src={cloudinaryPortrait(settings.doctorPhotoUrl, 256, 341, 0.65)}
                          alt={settings.doctorName ?? 'Doctor'}
                          revealBlur
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full gradient-primary flex items-center justify-center">
                          <span className="text-white text-3xl font-extrabold">
                            {(settings.doctorName ?? 'D').replace(/^Dr\.?\s*/i, '').charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green border-2 border-white shadow-sm z-20" />
                  </div>

                  {/* Name + title + location */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h1 className="text-xl lg:text-2xl xl:text-3xl font-extrabold text-navy tracking-tight leading-tight">
                      {settings.doctorName ?? 'Dr. Name'}
                    </h1>
                    <p className="text-primary font-semibold text-xs lg:text-sm mt-0.5">
                      {settings.doctorTitle ?? 'Consultant Cardiologist'}
                    </p>
                    {settings.doctorQuals && (
                      <p className="text-text-secondary text-[11px] mt-0.5 font-medium leading-snug">
                        {settings.doctorQuals}
                      </p>
                    )}
                    {settings.hospitalName && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin size={10} className="text-primary/60 shrink-0" />
                        <span className="text-[11px] text-text-secondary/70 font-medium">{settings.hospitalName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {doctorStats.map(({ icon: Icon, value, label }, idx) => (
                    <div
                      key={label}
                      className="relative text-center py-2.5 px-1.5 rounded-xl bg-gradient-to-b from-bg to-white border border-border/80 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group overflow-hidden"
                      style={{ animation: `fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) ${0.15 + idx * 0.07}s both` }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon size={14} className="mx-auto mb-1 text-primary/50 group-hover:text-primary transition-colors" />
                      <p className="text-sm lg:text-base font-extrabold text-navy leading-none">{value}</p>
                      <p className="text-[9px] lg:text-[10px] text-text-secondary mt-0.5 leading-tight font-medium">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Hospital address strip */}
                {settings.hospitalAddress && (
                  <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-bg border border-border/60">
                    <MapPin size={12} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-navy">{settings.hospitalName}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 leading-snug">{settings.hospitalAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {settings.doctorBio && (
              <p
                className="text-text-secondary text-sm leading-relaxed max-w-lg line-clamp-3"
                style={{ animation: 'fadeSlideLeft 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}
              >
                {settings.doctorBio}
              </p>
            )}

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row gap-2.5"
              style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both' }}
            >
              <Link
                href="/appointment"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white gradient-primary shadow-[0_4px_20px_rgba(21,101,216,0.30)] hover:shadow-[0_6px_28px_rgba(21,101,216,0.42)] hover:opacity-95 active:scale-[0.98] transition-all text-sm"
              >
                <Calendar size={15} />
                Book Appointment
              </Link>

              {waClean ? (
                <a
                  href={`https://wa.me/${waClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 border-[#25D366]/40 text-[#128C7E] bg-[#25D366]/5 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                    <path d="M12.031 0C5.384 0 .001 5.383.001 12.029c0 2.122.558 4.197 1.617 6.023L0 24l6.195-1.594A12.01 12.01 0 0012.03 24h.002C18.676 24 24.06 18.617 24.06 11.97 24.059 5.383 18.676 0 12.031 0zm5.453 16.56c-.298-.15-1.763-.87-2.036-.968-.273-.1-.472-.149-.671.15-.198.298-.768.968-.942 1.167-.174.199-.348.224-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.765-1.658-2.063-.173-.298-.018-.459.13-.607.134-.134.298-.349.447-.523.149-.174.199-.298.299-.497.1-.199.05-.373-.025-.522-.075-.15-.671-1.617-.919-2.214-.242-.581-.488-.502-.671-.511-.173-.008-.372-.01-.571-.01-.199 0-.522.074-.795.373-.273.298-1.044 1.02-1.044 2.488 0 1.468 1.069 2.886 1.218 3.085.15.199 2.104 3.21 5.096 4.502.712.307 1.268.491 1.701.629.715.227 1.366.195 1.88.118.573-.086 1.763-.72 2.012-1.416.249-.696.249-1.292.174-1.416-.075-.124-.273-.199-.572-.348z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              ) : settings.phone ? (
                <a
                  href={`tel:${phoneClean}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 border-border text-text-secondary hover:border-primary hover:text-primary transition-all"
                >
                  {settings.phone}
                </a>
              ) : null}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-3">
              {['✓ No registration needed', '✓ Instant confirmation', '✓ Free first consultation'].map((t) => (
                <span key={t} className="text-[11px] text-text-secondary font-medium">{t}</span>
              ))}
            </div>
          </div>


          {/* ══════════════════════════════════════════════
              RIGHT — Diseases slider
              Entrance: fade + slide in from right
          ══════════════════════════════════════════════ */}
          {total > 0 ? (
            <div
              className="relative flex flex-col"
              style={{ animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* ── Header row ── */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary/40 mb-0.5">
                    Conditions We Treat
                  </p>
                  <h2 className="text-base font-extrabold text-navy leading-tight">
                    Heart Diseases & Conditions
                  </h2>
                </div>

                {/* Nav buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prev}
                    className="relative w-9 h-9 rounded-xl border border-border/80 bg-white flex items-center justify-center hover:border-primary hover:text-primary hover:shadow-[0_0_0_3px_rgba(21,101,216,0.10)] active:scale-95 transition-all duration-150 shadow-sm overflow-hidden group/btn"
                    aria-label="Previous disease"
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={next}
                    className="relative w-9 h-9 rounded-xl border border-border/80 bg-white flex items-center justify-center hover:border-primary hover:text-primary hover:shadow-[0_0_0_3px_rgba(21,101,216,0.10)] active:scale-95 transition-all duration-150 shadow-sm overflow-hidden group/btn"
                    aria-label="Next disease"
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* ── Card with spinning animated border (same as doctor card) ── */}
              <div className="relative" style={{ height: '480px', minHeight: '480px' }}>
                {/* Spinning gradient border ring */}
                <AnimatedBorderRing />

                {/* Card body */}
                <div
                  className="relative overflow-hidden rounded-3xl border border-border/40 bg-white shadow-[0_8px_40px_rgba(21,101,216,0.13)] z-10"
                  style={{ height: '100%' }}
                >
                  {/* Top accent strip */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary z-20" />

                  {diseases.map((d, i) => (
                    <DiseaseSlide
                      key={d.id}
                      disease={d}
                      active={i === current}
                      direction={direction}
                    />
                  ))}
                </div>
              </div>

              {/* ── Footer: dots + autoplay bar + counter ── */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {diseases.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => go(i, i > current ? 'right' : 'left')}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                          i === current ? 'w-6 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border hover:bg-primary/40'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-text-secondary/40 font-medium tabular-nums">
                      {current + 1} / {total}
                    </span>
                    <Link
                      href="/diseases"
                      className="flex items-center gap-0.5 text-[11px] font-bold text-primary hover:text-navy transition-colors"
                    >
                      View all <ChevronRight size={11} />
                    </Link>
                  </div>
                </div>

                {/* Autoplay progress bar */}
                <div className="h-0.5 bg-border/60 rounded-full overflow-hidden">
                  <div
                    key={`${current}-${paused}`}
                    className="h-full rounded-full"
                    style={{
                      background: 'var(--gradient-primary)',
                      animation: paused ? 'none' : 'heroProgress 4.5s linear forwards',
                      width: paused ? '0%' : undefined,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="rounded-3xl border-2 border-dashed border-border bg-white flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                <Heart size={24} className="text-primary/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-navy">No diseases published yet</p>
                <p className="text-xs text-text-secondary mt-1">Publish articles from the admin dashboard</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Global keyframes ── */}
      <style jsx global>{`
        /* Autoplay progress */
        @keyframes heroProgress {
          from { width: 0% }
          to   { width: 100% }
        }

        /* Spinning conic-gradient border */
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spinBorder {
          to { --angle: 360deg; }
        }

        /* Entrance animations */
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Arrow bounce in connecting button */
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0);   }
          50%       { transform: translateX(4px); }
        }
      `}</style>
    </section>
  )
}
