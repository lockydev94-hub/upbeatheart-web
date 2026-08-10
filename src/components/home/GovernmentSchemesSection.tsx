/**
 * GovernmentSchemesSection — "Support Our Cause — Government Schemes"
 *
 * Design concept: a national-tricolor themed premium section that exposes the
 * four major Indian government / professional-body schemes a patient can use
 * to make cardiac care affordable. Each card uses a scheme-specific accent
 * palette and a small hero illustration that visually communicates WHO the
 * scheme is for — so visitors self-identify within seconds.
 *
 *  1. Ayushman Bharat (PM-JAY) — ₹5 lakh cover, cashless, empanelled hospitals
 *     hero: shield stamp + animated rupee highlight
 *  2. CSI (Cardiological Society of India) — professional body, ethical care
 *     hero: rotating award medallion with "MEMBER" ribbon
 *  3. RBSK (Rashtriya Bal Swasthya Karyakram) — child heart initiative, 0-18
 *     hero: holding hands with a small heart, growth ticker
 *  4. CGHS (Central Government Health Scheme) — central-govt employees/pensioners
 *     hero: government card/ID outline with golden tick
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
 *  4. Each card's hero illustration activates when in view (continuous loop)
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
  heroKey:    'ayushman' | 'csi' | 'rbsk' | 'cghs'
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
    accent: { text: 'text-green',  ring: 'group-hover:border-green/40',   glow: 'rgba(24,181,90,0.20)',  bgFrom: 'from-green/15',   bgVia: 'via-orange-500/8', bright: '#18B55A', pill: 'bg-green/8',   pillFg: 'text-green' },
    heroKey: 'ayushman',
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
    accent: { text: 'text-primary', ring: 'group-hover:border-primary/40', glow: 'rgba(21,101,216,0.18)', bgFrom: 'from-primary/15', bgVia: 'via-primary/5',  bright: '#1565D8', pill: 'bg-primary/8', pillFg: 'text-primary' },
    heroKey: 'csi',
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
    accent: { text: 'text-pink-600', ring: 'group-hover:border-pink-400/50', glow: 'rgba(236,72,153,0.18)', bgFrom: 'from-pink-500/15', bgVia: 'via-rose-500/5', bright: '#EC4899', pill: 'bg-pink-50',  pillFg: 'text-pink-700' },
    heroKey: 'rbsk',
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
    accent: { text: 'text-navy',     ring: 'group-hover:border-navy/40',     glow: 'rgba(20,59,125,0.20)', bgFrom: 'from-navy/15',    bgVia: 'via-amber-500/8', bright: '#143B7D', pill: 'bg-navy/8',     pillFg: 'text-navy' },
    heroKey: 'cghs',
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

/* ════════════════════════════════════════════════════════════════
   Hero illustrations — four SVG scenes
   ════════════════════════════════════════════════════════════════ */

/* 1. Ayushman Bharat — a shield with a rupee amount */
function AyushmanHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <defs>
        <linearGradient id="ab-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </linearGradient>
    </defs>
      {/* shield outline */}
      <path d="M48,8 L78,18 L78,48 C78,68 64,82 48,88 C32,82 18,68 18,48 L18,18 Z"
            fill="url(#ab-shield)" stroke={color} strokeWidth="2"
            strokeLinejoin="round"
            style={{
              transformBox: 'fill-box' as any,
              transformOrigin: '50% 50%',
              animation: active ? 'abScale 1.4s cubic-bezier(0.22,1,0.36,1) both, abPulse 2.4s ease-in-out 1.4s infinite' : 'none',
              opacity: 0.5,
            }} />
      {/* big ₹ symbol */}
      <text x="48" y="56" textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui" fontSize="34" fontWeight="900"
            fill={color} style={{ filter: `drop-shadow(0 1px 0 ${color}80)` }}>
        ₹
    </text>
      {/* rupee amount pulsing below */}
      {active && (
        <text x="48" y="74" textAnchor="middle"
              fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="700"
              fill={color} opacity="0.85">
          5 Lakh
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
      </text>
      )}
      <style>{`
        @keyframes abScale  { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes abPulse  {
          0%,100% { filter: drop-shadow(0 0 0 ${color}00); }
          50%     { filter: drop-shadow(0 0 10px ${color}); }
        }
      `}</style>
  </svg>
  )
}

/* 2. CSI — rotating medallion + member ribbon */
function CSIHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      {/* outer rotating ring (dashed) */}
      <g style={{
            transformBox: 'fill-box' as any,
            transformOrigin: '50% 50%',
            animation: active ? 'csiSpin 18s linear infinite' : 'none',
          }}>
        <circle cx="48" cy="48" r="34" fill="none" stroke={color} strokeWidth="1.2"
                strokeDasharray="4 5" opacity="0.55" />
    </g>
      {/* medallion */}
      <g style={{
            transformBox: 'fill-box' as any,
            transformOrigin: '50% 50%',
            animation: active ? 'csiPop 1.4s cubic-bezier(0.22,1,0.36,1) both, csiBob 3.2s ease-in-out 1.4s infinite' : 'none',
            opacity: 0.5,
          }}>
        <circle cx="48" cy="48" r="22" fill={color} />
        {/* inner star/heart for cardiology accent */}
        <path d="M48,58 C42,52 36,48 36,42 C36,38 39,36 42,36 C44,36 46,37 48,38 C50,37 52,36 54,36 C57,36 60,38 60,42 C60,48 54,52 48,58 Z"
              fill="white" opacity="0.95" />
        {/* bottom tail */}
        <path d="M40,68 L48,82 L56,68 Z" fill={color} />
    </g>
      <style>{`
        @keyframes csiSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes csiPop  { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes csiBob  {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-2px); }
        }
      `}</style>
  </svg>
  )
}

/* 3. RBSK — a child heart with growth pulse + sparkles */
function RBSKHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      {/* protective arc above */}
      <path d="M14,32 Q48,8 82,32"
            fill="none" stroke={color} strokeWidth="2" opacity="0.35"
            strokeDasharray="4 6" />
      {/* heart */}
      <g style={{
            transformBox: 'fill-box' as any,
            transformOrigin: '50% 55%',
            animation: active ? 'rbskBeat 2.2s ease-in-out infinite' : 'none',
          }}>
        <path d="M48,70 C40,60 28,52 28,42 C28,34 34,28 42,28 C46,28 48,30 48,30 C48,30 50,28 54,28 C62,28 68,34 68,42 C68,52 56,60 48,70 Z"
              fill={color} />
    </g>
      {/* mini growth bars (ascending) */}
      {active && [12, 36, 60, 84].map((y, i) => (
        <line key={i} x1={20 + i * 4} y1={y + 4} x2={20 + i * 4} y2={y - (i + 1) * 4}
              stroke={color} strokeWidth="2" opacity="0.7" strokeLinecap="round" />
      ))}
      {/* 4 sparkles around */}
      {[
        { x: 22, y: 24, d: '0s'   },
        { x: 74, y: 24, d: '0.5s' },
        { x: 18, y: 64, d: '1.0s' },
        { x: 78, y: 64, d: '1.5s' },
      ].map((s, i) => (
        <g key={i} style={{
              transformBox: 'fill-box' as any,
              transformOrigin: '50% 50%',
              animation: active ? `rbskPop 1.8s ease-in-out ${s.d} infinite` : 'none',
            }}>
          <circle cx={s.x} cy={s.y} r="2" fill={color} />
      </g>
      ))}
      <style>{`
        @keyframes rbskBeat { 0%,100% { transform: scale(1); } 14% { transform: scale(1.16); } 28% { transform: scale(1); } 42% { transform: scale(1.10); } 56% { transform: scale(1); } }
        @keyframes rbskPop  { 0%,100% { transform: scale(0.4); opacity: 0; } 50% { transform: scale(1.4); opacity: 1; } }
      `}</style>
  </svg>
  )
}

/* 4. CGHS — government ID card outline with sweeping check */
function CGHSHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      {/* ID card */}
      <rect x="14" y="20" width="68" height="50" rx="6"
            fill="none" stroke={color} strokeWidth="2"
            style={{
              transformBox: 'fill-box' as any,
              transformOrigin: '50% 50%',
              animation: active ? 'cghsCard 1.4s cubic-bezier(0.22,1,0.36,1) both' : 'none',
              opacity: 0.5,
            }} />
      {/* avatar circle on card */}
      <circle cx="30" cy="40" r="6" fill="none" stroke={color} strokeWidth="1.6" opacity="0.7" />
      {/* ID lines (text representation) */}
      <line x1="42" y1="36" x2="74" y2="36" stroke={color} strokeWidth="1.6" opacity="0.6" />
      <line x1="42" y1="44" x2="68" y2="44" stroke={color} strokeWidth="1.6" opacity="0.4" />
      <line x1="20" y1="56" x2="50" y2="56" stroke={color} strokeWidth="1.6" opacity="0.4" />
      <line x1="20" y1="62" x2="46" y2="62" stroke={color} strokeWidth="1.6" opacity="0.4" />
      {/* golden approved check (animated draw) */}
      <circle cx="72" cy="36" r="9" fill="#F59E0B" opacity={active ? 1 : 0}
              style={{ transition: 'opacity 0.6s ease 1.0s', filter: 'drop-shadow(0 0 4px #F59E0B)' }} />
      <polyline points="67,36 71,40 78,32"
                fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="20" strokeDashoffset={active ? 0 : 20}
                style={{ transition: active ? 'stroke-dashoffset 0.6s ease 1.4s' : 'none' }} />
      <style>{`
        @keyframes cghsCard { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
  </svg>
  )
}

function Hero({ keyName, active, color }: { keyName: SchemeDef['heroKey']; active: boolean; color: string }) {
  switch (keyName) {
    case 'ayushman': return <AyushmanHero active={active} color={color} />
    case 'csi':      return <CSIHero      active={active} color={color} />
    case 'rbsk':     return <RBSKHero     active={active} color={color} />
    case 'cghs':     return <CGHSHero     active={active} color={color} />
  }
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

        {/* Top hero illustration */}
        <div
          className={`relative h-32 sm:h-36 flex items-center justify-center overflow-hidden bg-gradient-to-br ${s.accent.bgFrom} via-white ${s.accent.bgVia}`}
        >
          {/* corner brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-slate-300" />
          <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-slate-300" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-slate-300" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-slate-300" />

          {/* hero SVG */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative z-10">
            <Hero keyName={s.heroKey} active={active} color={s.accent.bright} />
        </div>

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
