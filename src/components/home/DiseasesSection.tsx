'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart, ArrowRight, Shield, ChevronRight,
  Activity, Zap, Wind, Stethoscope, Microscope, TrendingUp,
} from 'lucide-react'
import type { Disease } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'
import { cloudinaryResize } from '@/lib/cloudinary'
import Reveal from '@/components/ui/Reveal'

interface Props {
  diseases: Disease[]
}

/* ── Helpers ──────────────────────────────────────────────────────── */
// Admin dashboard crops every disease cover to exactly 800×500 (8:5) via
// ImageCropUpload, and the artwork has the disease name burned into it.
// Requesting the same ratio makes Cloudinary's c_fill a pure resize — any
// other ratio silently chops the burned-in title.
function getCoverUrl(coverImage: Disease['coverImage']): string {
  let raw = ''
  if (!coverImage) return ''
  if (typeof coverImage === 'string') raw = coverImage
  else if (typeof coverImage === 'object' && 'url' in coverImage) raw = coverImage.url ?? ''
  return cloudinaryResize(raw, 800, 500, 'fill')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/* ── Category config ──────────────────────────────────────────────── */
const CATEGORY_CONFIG: Record<string, {
  gradient: string
  iconColor: string
  badgeBg: string
  badgeText: string
  dot: string
  icon: React.ElementType
  glow: string
}> = {
  'Heart Conditions':         { gradient: 'from-red-500/15 via-rose-500/5 to-transparent',   iconColor: 'text-red-500',    badgeBg: 'bg-red-50',    badgeText: 'text-red-700',    dot: 'bg-red-400',    icon: Heart,        glow: 'rgba(239,68,68,0.15)'    },
  'Arrhythmia':               { gradient: 'from-purple-500/15 via-violet-500/5 to-transparent', iconColor: 'text-purple-600', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700', dot: 'bg-purple-400', icon: Activity,     glow: 'rgba(139,92,246,0.15)'   },
  'Valvular Heart Disease':   { gradient: 'from-orange-500/15 via-amber-500/5 to-transparent',  iconColor: 'text-orange-600', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700', dot: 'bg-orange-400', icon: Shield,       glow: 'rgba(249,115,22,0.15)'   },
  'Vascular Conditions':      { gradient: 'from-blue-500/15 via-cyan-500/5 to-transparent',     iconColor: 'text-blue-600',   badgeBg: 'bg-blue-50',   badgeText: 'text-blue-700',   dot: 'bg-blue-400',   icon: TrendingUp,   glow: 'rgba(59,130,246,0.15)'   },
  'Congenital Heart Disease': { gradient: 'from-pink-500/15 via-rose-500/5 to-transparent',     iconColor: 'text-pink-600',   badgeBg: 'bg-pink-50',   badgeText: 'text-pink-700',   dot: 'bg-pink-400',   icon: Heart,        glow: 'rgba(236,72,153,0.15)'   },
  'Lifestyle & Prevention':   { gradient: 'from-green-500/15 via-emerald-500/5 to-transparent', iconColor: 'text-green-600',  badgeBg: 'bg-green-50',  badgeText: 'text-green-700',  dot: 'bg-green-400',  icon: Stethoscope,  glow: 'rgba(34,197,94,0.15)'    },
  'Cardiac Investigations':   { gradient: 'from-cyan-500/15 via-sky-500/5 to-transparent',      iconColor: 'text-cyan-600',   badgeBg: 'bg-cyan-50',   badgeText: 'text-cyan-700',   dot: 'bg-cyan-400',   icon: Microscope,   glow: 'rgba(6,182,212,0.15)'    },
}
function catCfg(cat: string) {
  return CATEGORY_CONFIG[cat] ?? {
    gradient: 'from-primary/15 via-primary/5 to-transparent',
    iconColor: 'text-primary', badgeBg: 'bg-primary/8', badgeText: 'text-primary',
    dot: 'bg-primary', icon: Stethoscope, glow: 'rgba(21,101,216,0.15)',
  }
}

const ALL_CATEGORIES = ['All', 'Heart Conditions', 'Arrhythmia', 'Valvular Heart Disease', 'Vascular Conditions', 'Congenital Heart Disease', 'Lifestyle & Prevention', 'Cardiac Investigations']

/* ── Disease Card ─────────────────────────────────────────────────── */
function DiseaseCard({ disease, index }: { disease: Disease; index: number }) {
  const cfg    = catCfg(disease.category)
  const Icon   = cfg.icon
  const imgUrl = getCoverUrl(disease.coverImage)
  const overview = stripHtml(disease.overview).slice(0, 120)
  const warnings = disease.earlyWarningSigns?.slice(0, 2) ?? []

  // Signature effect: cards weave in from alternate sides, so the grid
  // assembles itself rather than sliding up as one block.
  return (
    <Reveal
      effect={index % 2 === 0 ? 'drift-left' : 'drift-right'}
      delay={index * 70}
      offset={0.08}
      className="group relative"
    >
      <Link
        href={`/diseases/${disease.slug}`}
        className="block h-full rounded-2xl border border-border/70 bg-white overflow-hidden shadow-[0_2px_12px_rgba(21,101,216,0.07)] hover:shadow-[0_8px_32px_rgba(21,101,216,0.15)] hover:border-primary/25 transition-all duration-300 hover:-translate-y-1"
      >
        {/* ── Cover image ── */}
        <div className="relative overflow-hidden aspect-[8/5]">
          {imgUrl ? (
            <LazyImage
              src={imgUrl}
              alt={disease.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              revealBlur
              revealScale
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}
                 style={{ background: `radial-gradient(circle at 30% 50%, ${cfg.glow} 0%, transparent 70%), linear-gradient(135deg, #f8fafc 0%, #e8f0ff 100%)` }}>
              <div className="w-16 h-16 rounded-2xl bg-white/80 border border-border/60 shadow-sm flex items-center justify-center">
                <Icon size={28} className={cfg.iconColor} />
              </div>
            </div>
          )}

          {/* Badges live in the card body, not over the artwork — the cover
              images have the disease name burned in and an overlay sat on it. */}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex flex-col gap-3">

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {disease.category}
            </span>
            {disease.doctorVerified && (
              <span className="inline-flex items-center gap-1 bg-green/12 text-green text-[10px] font-bold px-2 py-1 rounded-full">
                <Shield size={9} />
                Verified
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-[15px] font-extrabold text-navy leading-tight line-clamp-2">
              {disease.title}
            </h3>
            {disease.tagline && (
              <p className="text-[11px] text-text-secondary/80 font-medium mt-1 line-clamp-1">{disease.tagline}</p>
            )}
          </div>

          {/* Warning signs OR overview */}
          {warnings.length > 0 ? (
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-text-secondary/40 mb-1.5">
                Key Warning Signs
              </p>
              <div className="space-y-1">
                {warnings.map(w => (
                  <div key={w} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-[4px] shrink-0" />
                    <span className="text-[11px] text-text-secondary leading-snug line-clamp-1">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-3">
              {overview}{overview.length >= 120 ? '…' : ''}
            </p>
          )}

          {/* Risk factor chips */}
          {(disease.riskFactors?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {disease.riskFactors.slice(0, 2).map(rf => (
                <span key={rf} className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary/70 border border-primary/12 rounded-full font-semibold">
                  {rf}
                </span>
              ))}
              {(disease.riskFactors?.length ?? 0) > 2 && (
                <span className="text-[10px] px-2 py-0.5 bg-border/60 text-text-secondary/60 rounded-full font-semibold">
                  +{disease.riskFactors.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* CTA row */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-[10px] text-text-secondary/40 font-medium">{disease.icdCode ? `ICD: ${disease.icdCode}` : 'Cardiology'}</span>
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-primary group-hover:gap-1.5 transition-all">
              Learn More
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

/* ── Floating stat badge ──────────────────────────────────────────── */
function StatBadge({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <Reveal
      effect="pop-center"
      delay={delay}
      className="bg-white rounded-2xl border border-border/60 shadow-[0_4px_20px_rgba(21,101,216,0.1)] px-5 py-4 text-center"
    >
      <p className="text-2xl font-extrabold text-navy leading-none">{value}</p>
      <p className="text-[11px] text-text-secondary mt-1 font-medium">{label}</p>
    </Reveal>
  )
}

/* ── Main Section ─────────────────────────────────────────────────── */
export default function DiseasesSection({ diseases }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')

  // deduplicate categories present in data
  const availableCategories = ['All', ...Array.from(new Set(diseases.map(d => d.category))).filter(c => ALL_CATEGORIES.includes(c))]

  const filtered = activeCategory === 'All'
    ? diseases
    : diseases.filter(d => d.category === activeCategory)

  // Show max 6 on homepage
  const displayed = filtered.slice(0, 6)

  if (diseases.length === 0) return null

  return (
    <section className="relative py-10 md:py-12 overflow-hidden bg-[#F8FAFC]">

      {/* ── Background decoration ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Soft blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-green/4 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-cyan/3 blur-[90px]" />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#1565D8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
      </div>

      <div className="container-max px-4 md:px-8 relative z-10">

        {/* ── Header ── */}
        <Reveal
          effect="fade-up"
          offset={0.08}
          className="text-center mb-7 md:mb-8"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Heart Disease Library
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-navy leading-tight tracking-tight lg:whitespace-nowrap">
            Conditions We{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-primary)' }}
            >
              Diagnose & Treat
            </span>
          </h2>

          <p className="text-text-secondary text-base md:text-lg leading-relaxed mt-4">
            Expert cardiology care backed by doctor-verified education. Every article reviewed and approved by our consultant cardiologist.
          </p>

          {/* Mini stats strip */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { value: `${diseases.length}+`, label: 'Conditions' },
              { value: `${diseases.length}`, label: 'Verified' },
              { value: '7', label: 'Specialities' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-extrabold text-primary leading-none">{value}</p>
                <p className="text-[11px] text-text-secondary mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Category filter pills ── */}
        <Reveal
          effect="fade-up"
          delay={60}
          offset={0.06}
          className="flex flex-wrap justify-center gap-2 mb-6 md:mb-7"
        >
          {availableCategories.map((cat) => {
            const cfg    = cat === 'All' ? null : catCfg(cat)
            const active = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-2 rounded-full border transition-all duration-200 ${
                  active
                    ? 'bg-primary text-white border-primary shadow-[0_4px_16px_rgba(21,101,216,0.30)]'
                    : 'bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary'
                }`}
              >
                {cfg && !active && (
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                )}
                {cat}
              </button>
            )
          })}
        </Reveal>

        {/* ── Disease cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {displayed.map((disease, i) => (
            <DiseaseCard key={disease.id} disease={disease} index={i} />
          ))}
        </div>

        {/* ── "View all" footer row ── */}
        <Reveal
          effect="fade-up"
          offset={0.04}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-7 pt-6 border-t border-border/60"
        >

          {/* Trust note */}
          <div className="flex items-center gap-2 text-text-secondary/60">
            <Shield size={13} className="text-green shrink-0" />
            <span className="text-[12px] font-medium">
              All disease articles are reviewed and approved by our consultant cardiologist
            </span>
          </div>

          {/* CTA */}
          <Link
            href="/diseases"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white gradient-primary shadow-[0_4px_20px_rgba(21,101,216,0.25)] hover:shadow-[0_6px_28px_rgba(21,101,216,0.38)] hover:opacity-95 active:scale-[0.98] transition-all shrink-0"
          >
            View All Conditions
            <ChevronRight size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
