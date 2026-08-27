/**
 * GovernmentSchemesSection — "Support Our Cause — Government Schemes"
 *
 * Design concept: a national-tricolor themed premium section that exposes the
 * four major Indian government / professional-body schemes a patient can use
 * to make cardiac care affordable. Each card uses a scheme-specific accent
 * palette and an animated GIF hero that visually communicates WHO the scheme
 * is for — so visitors self-identify within seconds.
 *
 *  1. Ayushman Bharat (PM-JAY) — ₹5 lakh cover, cashless, empanelled hospitals
 *     hero: Ayushman_Bharat_PM.gif (16:9 animated)
 *  2. CSI (Cardiological Society of India) — professional body, ethical care
 *     hero: Cardiological_Society_of_India.gif (16:9 animated)
 *  3. RBSK (Rashtriya Bal Swasthya Karyakram) — child heart initiative, 0-18
 *     hero: Rashtriya_Bal_Swasthya_Karyakr.gif (16:9 animated)
 *  4. CGHS (Central Government Health Scheme) — central-govt employees/pensioners
 *     hero: For_central_govt_employees_p.gif (16:9 animated)
 *
 * GIFs live in /public/animation/ and are loaded lazily so the page doesn't
 * pay the ~56 MB combined cost up front. Each GIF fades in once its card is
 * active (in viewport).
 *
 * Why this section exists:
 *   - Cardiac care is expensive; ~70% of out-of-pocket spend in India is borne
 *     by patients. A flagship section that names the schemes a clinic actually
 *     accepts removes the "can I afford this?" worry, often the #1 reason
 *     patients delay an appointment.
 *   - SEO surface for high-intent queries ("Ayushman Bharat hospital", "CGHS
 *     cardiologist", "RBSK heart treatment").
 *   - Builds trust at first scroll: shows the clinic participates in national
 *     programs and professional bodies.
 *
 * Animation layers (matches CardiologyTypesSection vocabulary):
 *  1. Tricolor top band scales-in left → right
 *  2. Eyebrow pulse, title scales-in, ECG underline draws
 *  3. Cards stagger up + in
 *  4. Each card's hero GIF fades in once the card is active
 *  5. Hover: card lifts, accent ring blooms, ECG line draws on underline
 *  6. Bottom "Eligibility check" CTA strip with shimmer
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,           // ayushman — shield of cover
  Award,                 // CSI  — professional medal
  Baby,                  // RBSK — child
  Building2,             // CGHS — government building / ID
  ArrowRight,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react'

/* ── Content (editable copy) ──────────────────────────────────────── */
interface SchemeDef {
  id:         string
  icon:       React.ElementType
  abbr:       string         // short tag (e.g. "PM-JAY")
  title:      string         // display name
  subtitle:   string         // 1-line "what is this" (above title inside card)
  blurb:      string         // "who is it for" sentence
  highlights: string[]       // 3 short bullets
  coverage?:  string         // highlight stat — e.g. "₹5 Lakh" or "0–18 yrs"
  eligible:   string         // eligibility one-liner
  gif:        string         // path to scheme illustration GIF (under /public)
  gifAlt:     string         // alt text for the GIF
  accent:     {
    text:   string   // text color class
    ring:   string   // border hover class
    glow:   string   // rgba for hover shadow
    bgFrom: string   // gradient config
    bgVia:  string
    bright: string   // bright accent (hex)
    pill:   string   // pill bg
    pillFg: string   // pill fg
  }
}

const SCHEMES: SchemeDef[] = [
  {
    id:         'ayushman',
    icon:       ShieldCheck,
    abbr:       'PM-JAY',
    title:      'Ayushman Bharat',
    subtitle:   "India's flagship health cover",
    blurb:      'Up to ₹5 lakh per family per year for secondary and tertiary care — cashless treatment at empanelled hospitals.',
    coverage:   '₹5 Lakh',
    eligible:   'Families listed in SECC database',
    highlights: [
      'Cashless hospitalisation',
      'Pre-existing conditions covered',
      'Pan-India portability',
    ],
    gif:        '/animation/Ayushman_Bharat_PM.gif',
    gifAlt:     'Ayushman Bharat PM-JAY scheme illustration',
    accent: { text: 'text-green',  ring: 'group-hover:border-green/40',   glow: 'rgba(24,181,90,0.20)',  bgFrom: 'from-green/15',   bgVia: 'via-orange-500/8', bright: '#18B55A', pill: 'bg-green/8',   pillFg: 'text-green' },
  },
  {
    id:         'csi',
    icon:       Award,
    abbr:       'CSI',
    title:      'Cardiological Society of India',
    subtitle:   'National cardiac professional body',
    blurb:      'Active member of India\'s premier cardiology society — care aligned with national protocols and continuing cardiac education.',
    eligible:   'All patients at par rates',
    highlights: [
      'MCI-recognised protocols',
      'CME-accredited practice',
      'Evidence-based treatment plans',
    ],
    gif:        '/animation/Cardiological_Society_of_India.gif',
    gifAlt:     'Cardiological Society of India membership illustration',
    accent: { text: 'text-primary', ring: 'group-hover:border-primary/40', glow: 'rgba(21,101,216,0.18)', bgFrom: 'from-primary/15', bgVia: 'via-primary/5',  bright: '#1565D8', pill: 'bg-primary/8', pillFg: 'text-primary' },
  },
  {
    id:         'rbsk',
    icon:       Baby,
    abbr:       'RBSK',
    title:      'Rashtriya Bal Swasthya Karyakram',
    subtitle:   'National child health mission',
    blurb:      'Free screening, early treatment and follow-up for children 0–18 years — including congenital & acquired heart disease.',
    coverage:   '0–18 yrs',
    eligible:   'All children, school-based screening',
    highlights: [
      'Congenital heart screening',
      'Free cardiac surgery referral',
      'School health-camp tie-up',
    ],
    gif:        '/animation/Rashtriya_Bal_Swasthya_Karyakr.gif',
    gifAlt:     'Rashtriya Bal Swasthya Karyakram child heart scheme illustration',
    accent: { text: 'text-pink-600', ring: 'group-hover:border-pink-400/50', glow: 'rgba(236,72,153,0.18)', bgFrom: 'from-pink-500/15', bgVia: 'via-rose-500/5', bright: '#EC4899', pill: 'bg-pink-50',  pillFg: 'text-pink-700' },
  },
  {
    id:         'cghs',
    icon:       Building2,
    abbr:       'CGHS',
    title:      'Central Government Health Scheme',
    subtitle:   'For central-govt employees & pensioners',
    blurb:      'Comprehensive OPD, indoor and investigations cover for serving / retired central government employees and their dependents.',
    eligible:   'CGHS card holders & dependents',
    highlights: [
      'Cashless OPD & IPD',
      'Reimbursement for procedures',
      'Investigations empanelled',
    ],
    gif:        '/animation/For_central_govt_employees_p.gif',
    gifAlt:     'Central Government Health Scheme illustration for employees and pensioners',
    accent: { text: 'text-navy',     ring: 'group-hover:border-navy/40',     glow: 'rgba(20,59,125,0.20)', bgFrom: 'from-navy/15',    bgVia: 'via-amber-500/8', bright: '#143B7D', pill: 'bg-navy/8',     pillFg: 'text-navy' },
  },
]

/* ── Scroll-reveal hook ──────────────────────────────────────── */
function useVisible(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible: v }
}

/* ── Animated ECG underline (draws on hover) ────────────────── */
function ECGHoverLine({ color }: { color: string }) {
  const path = 'M0,12 L18,12 L26,12 L32,4 L38,22 L44,2 L50,20 L56,12 L80,12'
  return (
    <svg viewBox="0 0 80 24" className="w-full h-5" aria-hidden>
      <polyline
        points={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="120"
        strokeDashoffset="120"
        style={{
          opacity: 0.7,
          transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s',
        }}
        className="group-hover:[stroke-dashoffset:0]"
      />
  </svg>
  )
}

/* ── Tiny ECG line in header ─────────────────────────────────── */
function ECGHeader({ active, color = '#1565D8' }: { active: boolean; color?: string }) {
  return (
    <svg viewBox="0 0 360 36" className="w-full h-9" aria-hidden>
      <polyline
        points="M0,18 L40,18 L52,18 L60,6 L68,32 L76,4 L84,30 L92,18 L110,18"
        fill="none" stroke={color} strokeWidth="1.4" opacity="0.18"
      />
      <polyline
        points="M0,18 L40,18 L52,18 L60,6 L68,32 L76,4 L84,30 L92,18 L110,18"
        fill="none" stroke={color} strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="240"
        strokeDashoffset={active ? 0 : 240}
        style={{
          transition: active ? 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.2s' : 'none',
          filter: `drop-shadow(0 0 4px ${color}80)`,
        }}
      />
  </svg>
  )
}

/* ── Card ──────────────────────────────────────────────── */
function SchemeCard({ s, index, active }: { s: SchemeDef; index: number; active: boolean }) {
  const Icon = s.icon
  const delay = 120 + index * 110
  const glow  = s.accent.glow

  return (
    <article
      className="group relative h-full"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
    >
      <div
        className={`gs-card-${s.id} relative h-full rounded-2xl border border-border bg-white overflow-hidden
                    hover:-translate-y-1.5 transition-all duration-300
                    ${s.accent.ring}`}
        style={{
          boxShadow: `0 2px 12px rgba(21,101,216,0.06)`,
          ['--card-glow' as any]: glow,
        } as React.CSSProperties}
      >
        <style>{`
          .gs-card-${s.id}:hover { box-shadow: 0 18px 50px ${glow}; }
        `}</style>

        {/* Top hero illustration — animated GIF (16:9) */}
        <div
          className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${s.accent.bgFrom} via-white ${s.accent.bgVia}`}
        >
          {/* corner brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-slate-300 z-10" />
          <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-slate-300 z-10" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-slate-300 z-10" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-slate-300 z-10" />

          {/* scheme GIF — fills the 16:9 area, fades in once card is active */}
          {/*
            Plain <img> (not next/image): GIFs are already a compressed animated
            format and next/image can't optimise them — it'd just pass through.
            `loading="lazy"` defers the 6–34 MB GIF fetch until the card scrolls
            near the viewport; `decoding="async"` keeps the main thread free.
          */}
          <img
            src={s.gif}
            alt={s.gifAlt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{
              opacity: active ? 1 : 0,
              transitionDelay: `${delay}ms`,
            }}
          />

          {/* coverage badge top-right (e.g. "₹5 Lakh") */}
          {s.coverage && (
            <div
              className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                          text-[11px] font-extrabold uppercase tracking-[0.10em]
                          ${s.accent.pill} ${s.accent.pillFg}`}
              style={{
                transform: active ? 'scale(1)' : 'scale(0.6)',
                opacity: active ? 1 : 0,
                transition: `transform 0.4s cubic-bezier(0.34,1.56,0.7,1) ${delay + 300}ms, opacity 0.2s ease ${delay + 300}ms`,
              }}
            >
              {s.coverage}
          </div>
          )}
      </div>

        {/* Body */}
        <div className="p-5 pt-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-[10.5px] font-bold uppercase tracking-[0.14em] ${s.accent.text}`}>
                {s.subtitle}
            </p>
              <h3 className="mt-1 text-[16px] font-extrabold text-navy leading-snug group-hover:text-primary transition-colors">
                {s.title}
            </h3>
          </div>
            <span
              className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-50
                          border border-border flex items-center justify-center
                          ${s.accent.text}
                          group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300
                          shadow-sm`}
            >
              <Icon size={17} strokeWidth={2.2} />
          </span>
        </div>

          <p className="text-[12.5px] text-text-secondary leading-relaxed">{s.blurb}</p>

          {/* eligibility chip */}
          <div className="flex items-center gap-1.5 text-[10.5px] text-text-secondary bg-bg/80 border border-border rounded-md px-2 py-1.5">
            <CheckCircle2 size={11} className={s.accent.text} />
            <span>{s.eligible}</span>
        </div>

          {/* highlights list */}
          <ul className="space-y-1.5">
            {s.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-[11.5px] text-text-primary"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateX(0)' : 'translateX(-6px)',
                  transition: `opacity 0.5s ease ${delay + 400 + i * 80}ms, transform 0.5s ease ${delay + 400 + i * 80}ms`,
                }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: s.accent.bright }} />
                {h}
            </li>
            ))}
        </ul>

          {/* hover ECG underline */}
          <div className="mt-2 -mx-1">
            <ECGHoverLine color={s.accent.bright} />
        </div>
      </div>
    </div>
  </article>
  )
}

/* ── Bottom CTA strip ──────────────────────────────────── */
function EligibilityStrip({ active }: { active: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.98)',
        transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 250ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) 250ms',
        background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B55A 100%)',
      }}
    >
      {/* decor */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -right-8 -top-14 w-56 h-56 rounded-full bg-cyan/20 blur-[60px]" />
        <div className="absolute -left-10 -bottom-12 w-56 h-56 rounded-full bg-orange-500/20 blur-[60px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gsDots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.2" fill="#ffffff" />
          </pattern>
        </defs>
          <rect width="100%" height="100%" fill="url(#gsDots)" />
      </svg>
    </div>

      <div className="px-6 md:px-12 py-9 md:py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-7">
          {/* pulsing check icon */}
          <div className="shrink-0 anim-heartbeat w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-[0_6px_28px_rgba(24,184,230,0.35)]">
            <ShieldCheck size={30} strokeWidth={2.2} />
        </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] tracking-[0.2em] uppercase text-cyan-100 font-bold mb-1">
              Not sure if you&rsquo;re covered?
          </p>
            <h3 className="text-xl md:text-3xl font-extrabold leading-tight">
              Let us check your eligibility.{' '}
              <span className="shimmer-text">At no cost</span>
          </h3>
            <p className="text-white/75 text-sm mt-2 max-w-md mx-auto md:mx-0">
              Call our desk with your Aadhaar / CGHS card and we&rsquo;ll tell you exactly what your scheme covers — before your visit.
          </p>
        </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white text-navy hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
            >
              <PhoneCall size={15} />
              Talk to us
              <ArrowRight size={15} />
          </Link>
            <Link
              href="/appointment"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-white/30 text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
            >
              Book a visit
          </Link>
        </div>
      </div>
     </div>
   </div>
  )
}

/* ── Tricolor animated top band ────────────────────────────── */
function TricolorBand({ active }: { active: boolean }) {
  return (
    <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-slate-100 mb-8 md:mb-10">
      <div className="h-full bg-orange-500"
           style={{
             width: active ? '33.33%' : '0%',
             transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1) 0.0s',
           }} />
      <div className="h-full bg-white border-x border-slate-200"
           style={{
             width: active ? '33.33%' : '0%',
             transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s',
           }} />
      <div className="h-full bg-green-500"
           style={{
             width: active ? '33.33%' : '0%',
             transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1) 0.8s',
           }} />
  </div>
  )
}

/* ── Main section ─────────────────────────────────── */
export default function GovernmentSchemesSection() {
  const { ref, visible } = useVisible(0.05)

  return (
    <section ref={ref} className="py-14 md:py-20 bg-white relative overflow-hidden">
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-primary/5 blur-[90px]" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-green/5 blur-[90px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gsBgDots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#1565D8" />
          </pattern>
        </defs>
          <rect width="100%" height="100%" fill="url(#gsBgDots)" />
      </svg>
    </div>

      <div className="container-max px-4 md:px-8 relative z-10">
        {/* Tricolor band */}
        <div className="max-w-3xl mx-auto">
          <TricolorBand active={visible} />
      </div>

        {/* ── Header ── */}
        <div
          className="text-center max-w-3xl mx-auto mb-10 md:mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.96)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
            Support Our Cause
        </div>

          <h2 className="text-2xl md:text-4xl lg:text-[2.6rem] font-extrabold text-navy leading-tight tracking-tight">
            Cardiac care made{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-primary)' }}
            >
              affordable
           </span>
            .
        </h2>

          <div className="my-4 max-w-md mx-auto">
            <ECGHeader active={visible} color="#18B55A" />
        </div>

          <p className="text-text-secondary text-base md:text-lg leading-relaxed">
            We accept India&rsquo;s major government and professional-body programs so
            that cost is never the reason you delay a heart check-up.
        </p>
      </div>

        {/* ── Card grid: 4 schemes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {SCHEMES.map((s, i) => (
            <SchemeCard key={s.id} s={s} index={i} active={visible} />
          ))}
      </div>

        {/* ── Eligibility CTA ── */}
        <div className="mt-10 md:mt-12">
          <EligibilityStrip active={visible} />
      </div>
    </div>
  </section>
  )
}
