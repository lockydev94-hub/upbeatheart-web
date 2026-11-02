/**
 * CardiologyTypesSection — "The Six Pillars of Cardiac Care"
 *
 * Design concept: each of the six cardiology sub-specialties is shown as a
 * premium animated card whose hero illustration visually communicates the
 * specialty's work — so a non-medical visitor understands the difference
 * within seconds of looking at the screen.
 *
 *  1. General Cardiology  → heartbeat pulse (stethoscope + heart)
 *  2. Interventional     → catheter sliding through a coronary artery
 *  3. Electrophysiology  → flatline correcting to a normal sinus beat
 *  4. Preventive         → shield closing to protect a healthy heart
 *  5. Paediatric         → small heart with a growth / recovery pulse
 *  6. Cardiac Imaging    → scan line sweeping an ultrasound frame
 *
 * Why this section matters (SEO + UX):
 *   - Patients often don't know which sub-specialist they need. Showing all
 *     six in plain language helps them self-identify before they call.
 *   - Each card's micro-animation explains the specialty in <2s — better
 *     than a tagline for retention.
 *   - Long-tail SEO keywords ("interventional cardiologist", "paediatric
 *     cardiology") surface as visible content on the home page itself.
 *   - Show/hide toggle lives in the admin Settings page (cardiologyTypes).
 *
 * Animation layers (useScrollReveal + CSS, matching MythsSection — they replay
 * on every pass, in both directions):
 *  1. Eyebrow pulse, title scales-in, ECG trace draws left→right
 *  2. Subtitle fades up
 *  3. Six cards stagger up + in
 *  4. Each card's hero SVG activates (continuous loop)
 *  5. On hover: card lifts, ECG underline draws, accent ring blooms
 *  6. Bottom "Specialist CTA" strip fades in with shimmer
 */
'use client'

import Link from 'next/link'
import {
  HeartPulse,         // general / paediatric
  Stethoscope,        // general
  Activity,           // interventional
  Zap,                // electrophysiology
  ShieldCheck,        // preventive
  Baby,               // paediatric
  ScanLine,           // cardiac imaging
  ArrowRight,
  Calendar,
} from 'lucide-react'
import useScrollReveal, { type ScrollDirection } from '@/hooks/useScrollReveal'
import Reveal from '@/components/ui/Reveal'

/* ── Content (editable copy — change here, no props needed) ──────────────── */
interface TypeDef {
  id:          string
  icon:        React.ElementType
  title:       string
  subtitle:    string   // shown above title inside the card
  blurb:       string   // the "what they do" line — patient-friendly
  highlights:  string[] // 3 short bullets for the visitor
  accent:      {
    text:   string  // tailwind text color class
    ring:   string  // tailwind border-hover color
    glow:   string  // rgba glow color (CSS)
    bgFrom: string  // gradient start
    bgVia:  string  // gradient mid
    bright: string  // bright accent for stroke/glow
    pill:   string  // pill bg
    pillFg: string  // pill fg
  }
  heroKey:     'pulse' | 'catheter' | 'wave' | 'shield' | 'paeds' | 'scan'
}

const TYPES: TypeDef[] = [
  {
    id:         'general',
    icon:       Stethoscope,
    title:      'General Cardiology',
    subtitle:   'For everyday heart care',
    blurb:      'Comprehensive evaluation of chest pain, palpitations, blood pressure and risk factors — your first stop for any heart concern.',
    highlights: ['ECG & Echo review', 'BP / cholesterol plan', 'Second-opinion consult'],
    accent:     { text: 'text-primary',  ring: 'group-hover:border-primary/40', glow: 'rgba(21,101,216,0.18)', bgFrom: 'from-primary/15',  bgVia: 'via-primary/5',  bright: '#1565D8', pill: 'bg-primary/8',  pillFg: 'text-primary' },
    heroKey:    'pulse',
  },
  {
    id:         'interventional',
    icon:       Activity,
    title:      'Interventional Cardiology',
    subtitle:   'Adult procedures & stents',
    blurb:      'Catheter-based treatment of blocked arteries — angioplasty and stenting performed without open surgery, faster recovery, smaller scars.',
    highlights: ['Angioplasty & stenting', 'Complex coronary work', 'Heart-team decision support'],
    accent:     { text: 'text-cyan',      ring: 'group-hover:border-cyan/40',     glow: 'rgba(24,184,230,0.20)', bgFrom: 'from-cyan/15',     bgVia: 'via-cyan/5',     bright: '#18B8E6', pill: 'bg-cyan/8',     pillFg: 'text-cyan' },
    heroKey:    'catheter',
  },
  {
    id:         'electrophysiology',
    icon:       Zap,
    title:      'Electrophysiology',
    subtitle:   'Heart rhythm specialists',
    blurb:      'Diagnosis and treatment of irregular heartbeats — ablation, device implantation and rhythm drug therapy for safer, steadier living.',
    highlights: ['AF / SVT / VT ablation', 'Pacemaker & ICD care', 'Holter & loop monitoring'],
    accent:     { text: 'text-error',     ring: 'group-hover:border-error/40',    glow: 'rgba(220,38,38,0.18)',  bgFrom: 'from-error/10',    bgVia: 'via-error/5',    bright: '#DC2626', pill: 'bg-error/8',    pillFg: 'text-error' },
    heroKey:    'wave',
  },
  {
    id:         'preventive',
    icon:       ShieldCheck,
    title:      'Preventive Cardiology',
    subtitle:   'Stop problems before they start',
    blurb:      'Lipid, diabetes, lifestyle and family-risk programs built around you — precise risk scoring, structured reduction, regular follow-up.',
    highlights: ['10-year risk score', 'Lipid & apo-B management', 'Lifestyle coaching'],
    accent:     { text: 'text-green',     ring: 'group-hover:border-green/50',    glow: 'rgba(24,181,90,0.20)',  bgFrom: 'from-green/15',   bgVia: 'via-green/5',    bright: '#18B55A', pill: 'bg-green/8',   pillFg: 'text-green' },
    heroKey:    'shield',
  },
  {
    id:         'paediatric',
    icon:       Baby,
    title:      'Paediatric Cardiology',
    subtitle:   'Hearts from newborn to teen',
    blurb:      'Evaluation of murmurs, congenital heart disease and chest symptoms in children — with parents fully briefed at every step.',
    highlights: ['Newborn screening', 'CHD follow-up', 'School & sports clearance'],
    accent:     { text: 'text-pink-500',  ring: 'group-hover:border-pink-400/50', glow: 'rgba(236,72,153,0.18)', bgFrom: 'from-pink-500/15', bgVia: 'via-pink-500/5', bright: '#EC4899', pill: 'bg-pink-50',  pillFg: 'text-pink-600' },
    heroKey:    'paeds',
  },
  {
    id:         'imaging',
    icon:       ScanLine,
    title:      'Cardiac Imaging',
    subtitle:   'See the heart in detail',
    blurb:      'Echocardiography, stress imaging and CT/MRI of the heart performed and interpreted by a cardiologist — reports your doctor can act on.',
    highlights: ['2D & 3D echocardiography', 'Treadmill / stress echo', 'CT coronary angiography'],
    accent:     { text: 'text-indigo-500', ring: 'group-hover:border-indigo-400/50', glow: 'rgba(99,102,241,0.18)', bgFrom: 'from-indigo-500/15', bgVia: 'via-indigo-500/5', bright: '#6366F1', pill: 'bg-indigo-50', pillFg: 'text-indigo-600' },
    heroKey:    'scan',
  },
]

/* ── Scroll-reveal hook (same vocabulary as MythsSection) ─────────────── */
/**
 * Replaying scroll trigger. `eagerness` is how far into the viewport the element
 * must travel before it fires, as a fraction of viewport height.
 */
function useVisible(eagerness = 0.08) {
  return useScrollReveal<HTMLElement>({ offset: eagerness })
}

/* ── Reusable animated ECG pull-quote (used in header) ─────────────── */
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

/* ── Bottom-of-card ECG underline (draws on hover) ─────────────────── */
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

/* ════════════════════════════════════════════════════════════════════════
   Hero illustrations — six small SVG scenes that animate continuously
   when the card scrolls into view (active === true).
   ════════════════════════════════════════════════════════════════════════ */

/* 1. General — pulsating heart with stethoscope Y-tube behind it */
function PulseHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <defs>
        <linearGradient id="hp-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
       </linearGradient>
     </defs>
      {/* stethoscope curve */}
      <path d="M22,18 C18,30 18,46 28,52 C32,55 32,62 36,66"
            fill="none" stroke={color} strokeWidth="2.4"
            strokeLinecap="round" opacity="0.55" />
      <path d="M74,18 C78,30 78,46 68,52 C64,55 64,62 60,66"
            fill="none" stroke={color} strokeWidth="2.4"
            strokeLinecap="round" opacity="0.55" />
      {/* glow circle */}
      <circle cx="48" cy="62" r="28" fill="url(#hp-glow)" opacity={active ? 1 : 0.3}
              style={{ transition: 'opacity 0.6s ease' }} />
      {/* heart — pulses */}
      <g style={{
            transformBox: 'fill-box' as any,
            transformOrigin: '50% 60%',
            animation: active ? 'heartbeat 2.2s ease-in-out infinite' : 'none',
          }}>
        <path d="M48,82 C40,72 28,64 28,52 C28,44 34,38 42,38 C46,38 48,40 48,40 C48,40 50,38 54,38 C62,38 68,44 68,52 C68,64 56,72 48,82 Z"
              fill={color} />
     </g>
   </svg>
  )
}

/* 2. Interventional — catheter sliding into a coronary artery */
function CatheterHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      {/* artery outline */}
      <path d="M8,64 C28,40 60,40 88,54"
            fill="none" stroke="#DCE3EC" strokeWidth="14" strokeLinecap="round" />
      <path d="M8,64 C28,40 60,40 88,54"
            fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      {/* narrowing (stenosis) ring */}
      <ellipse cx="48" cy="46" rx="6" ry="9" fill="#FFEDD5" opacity="0.85" />
      {/* catheter wire — slides through */}
      <line x1="-10" y1="74" x2="96" y2="74"
            stroke={color} strokeWidth="2.4" strokeLinecap="round"
            strokeDasharray="60 200"
            strokeDashoffset={active ? -120 : 90}
            style={{ transition: active ? 'stroke-dashoffset 2.8s linear infinite' : 'none', filter: `drop-shadow(0 0 3px ${color})` }} />
      <circle cx="48" cy="46" r="3.2" fill={color}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      {/* tiny balloon expanding */}
      <ellipse cx="48" cy="46" rx="2" ry="2.4" fill={color}
               style={{
                 transformBox: 'fill-box' as any, transformOrigin: '50% 50%',
                 animation: active ? 'balloon 2.8s ease-in-out infinite' : 'none',
               }} />
      <style>{`
        @keyframes balloon {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          45%      { transform: scale(1.9); opacity: 1; }
          55%      { transform: scale(1.9); opacity: 1; }
        }
      `}</style>
   </svg>
  )
}

/* 3. Electrophysiology — flatline correcting to normal sinus */
function WaveHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      {/* baseline grid */}
      {[40, 56, 72].map(y => (
        <line key={y} x1="6" y1={y} x2="90" y2={y} stroke="#E5E7EB" strokeWidth="0.7" />
      ))}
      {/* flatline fading into a real beat */}
      <polyline
        points="6,56 30,56 38,56"
        fill="none" stroke="#94A3B8" strokeWidth="2" opacity="0.5" />
      {/* real beat — line draws on */}
      <polyline
        points="38,56 44,56 47,38 50,72 54,28 58,68 62,56 70,56 76,44 80,62 84,56 90,56"
        fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="160"
        strokeDashoffset={active ? 0 : 160}
        style={{
          transition: active ? 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.2s' : 'none',
          filter: `drop-shadow(0 0 3px ${color}80)`,
        }}
      />
      {/* traveling dot */}
      {active && (
        <circle r="2.4" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            begin="1.4s"
            path="M38,56 L44,56 L47,38 L50,72 L54,28 L58,68 L62,56 L84,56"
          />
       </circle>
      )}
   </svg>
  )
}

/* 4. Preventive — shield closing around a heart with checkmark pulse */
function ShieldHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      <defs>
        <linearGradient id="sh-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
       </linearGradient>
     </defs>
      {/* shield */}
      <path d="M48,12 L78,22 L78,48 C78,66 64,80 48,86 C32,80 18,66 18,48 L18,22 Z"
            fill="url(#sh-fill)" stroke={color} strokeWidth="2"
            strokeLinejoin="round"
            style={{
              transformBox: 'fill-box' as any,
              transformOrigin: '50% 50%',
              animation: active ? 'ctGrowIn 1.4s cubic-bezier(0.22,1,0.36,1) both, ctPulseGlow 2.4s ease-in-out 1.4s infinite' : 'none',
              opacity: 0.5,
            }} />
      {/* heart inside */}
      <path d="M48,68 C42,60 32,54 32,46 C32,40 36,36 42,36 C46,36 48,38 48,38 C48,38 50,36 54,36 C60,36 64,40 64,46 C64,54 54,60 48,68 Z"
            fill={color} opacity="0.85"
            style={{
              transformBox: 'fill-box' as any,
              transformOrigin: '50% 60%',
              animation: active ? 'heartbeat 2.4s ease-in-out 1.6s infinite' : 'none',
            }} />
      <style>{`
        @keyframes ctGrowIn { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes ctPulseGlow {
          0%,100% { filter: drop-shadow(0 0 0 ${color}00); }
          50%     { filter: drop-shadow(0 0 10px ${color}); }
        }
      `}</style>
   </svg>
  )
}

/* 5. Paediatric — small heart, hands cupped around it (parent's care) */
function PaedsHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      {/* protective arc above */}
      <path d="M14,40 Q48,8 82,40"
            fill="none" stroke={color} strokeWidth="2" opacity="0.4"
            strokeDasharray="6 6" />
      {/* heart (smaller, centered) */}
      <g style={{
            transformBox: 'fill-box' as any,
            transformOrigin: '50% 55%',
            animation: active ? 'heartbeat 2.2s ease-in-out infinite' : 'none',
          }}>
        <path d="M48,70 C40,60 28,52 28,42 C28,34 34,28 42,28 C46,28 48,30 48,30 C48,30 50,28 54,28 C62,28 68,34 68,42 C68,52 56,60 48,70 Z"
              fill={color} />
     </g>
      {/* tiny ECG tick — moves across */}
      {active && (
        <circle r="1.6" fill="white" opacity="0.9">
          <animateMotion dur="2.6s" repeatCount="indefinite"
            path="M14,82 L34,82 L40,82 L44,74 L48,88 L52,68 L56,84 L60,82 L82,82" />
       </circle>
      )}
      {/* 3 sparkles */}
      {[
        { x: 78, y: 22, d: '0s'   },
        { x: 14, y: 60, d: '0.6s' },
        { x: 76, y: 56, d: '1.2s' },
      ].map((s, i) => (
        <g key={i} style={{
              transformBox: 'fill-box' as any,
              transformOrigin: '50% 50%',
              animation: active ? `ctSparklePop 1.8s ease-in-out ${s.d} infinite` : 'none',
            }}>
          <circle cx={s.x} cy={s.y} r="1.8" fill={color} />
       </g>
      ))}
      <style>{`
        @keyframes ctSparklePop {
          0%, 100% { transform: scale(0.4); opacity: 0; }
          50%      { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
   </svg>
  )
}

/* 6. Cardiac Imaging — scan line sweeping a heart silhouette */
function ScanHero({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="w-full h-full">
      {/* viewfinder frame */}
      <rect x="10" y="10" width="76" height="76" rx="10"
            fill="none" stroke={color} strokeWidth="2" opacity="0.45" />
      {/* corner brackets */}
      {[[10,10],[86,10],[10,86],[86,86]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={color} />
      ))}
      {/* heart (faded) */}
      <path d="M48,72 C38,60 24,52 24,40 C24,32 30,26 38,26 C44,26 48,30 48,30 C48,30 52,26 58,26 C66,26 72,32 72,40 C72,52 58,60 48,72 Z"
            fill="none" stroke={color} strokeWidth="1.6" opacity="0.6" />
      {/* scan line — sweeps vertical */}
      <line x1="22" y1="86" x2="22" y2="14"
            stroke={color} strokeWidth="2"
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              animation: active ? 'scanline 2.2s ease-in-out infinite' : 'none',
            }}>
            {active && (
              <animate attributeName="x1" values="22;74;22" dur="2.2s" repeatCount="indefinite" />
            )}
         </line>
      <line x1="22" y1="86" x2="22" y2="14"
            stroke={color} strokeWidth="2"
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              animation: active ? 'scanline 2.2s ease-in-out infinite' : 'none',
            }}>
            {active && (
              <animate attributeName="x2" values="22;74;22" dur="2.2s" repeatCount="indefinite" />
            )}
         </line>
      {/* measurement tick marks */}
      {active && [24, 38, 52, 66].map((y, i) => (
        <line key={i} x1="76" y1={y} x2="80" y2={y} stroke={color} strokeWidth="1" opacity="0.6" />
      ))}
      <style>{`
        @keyframes scanline {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
      `}</style>
   </svg>
  )
}

function Hero({ keyName, active, color }: { keyName: TypeDef['heroKey']; active: boolean; color: string }) {
  switch (keyName) {
    case 'pulse':    return <PulseHero   active={active} color={color} />
    case 'catheter': return <CatheterHero active={active} color={color} />
    case 'wave':     return <WaveHero    active={active} color={color} />
    case 'shield':   return <ShieldHero  active={active} color={color} />
    case 'paeds':    return <PaedsHero   active={active} color={color} />
    case 'scan':     return <ScanHero    active={active} color={color} />
  }
}

/* ── Card ─────────────────────────────────────────────────────────── */
function TypeCard({ t, index, active, direction }: {
  t: TypeDef; index: number; active: boolean; direction: ScrollDirection
}) {
  const Icon = t.icon
  const delay = 120 + index * 110
  const glow  = t.accent.glow

  return (
    <Reveal
      as="article"
      effect="tilt-settle"
      delay={delay}
      visible={active}
      direction={direction}
      className="group relative h-full"
    >
      <div
        className={`ct-card-${t.id} relative h-full rounded-2xl border border-border bg-white overflow-hidden
                    hover:-translate-y-1.5 transition-all duration-300
                    ${t.accent.ring}`}
        style={{
          // base shadow + dynamic hover shadow with card-specific glow color
          boxShadow: `0 2px 12px rgba(21,101,216,0.06)`,
          // CSS variable so the hover class can reuse the card's accent color
          ['--card-glow' as any]: glow,
        } as React.CSSProperties}
      >
        {/* bottom ECG draw-on-hover */}
        <style>{`
          .ct-card-${t.id}:hover { box-shadow: 0 18px 50px ${glow}; }
        `}</style>

        {/* Top hero illustration */}
        <div
          className={`relative h-32 sm:h-36 flex items-center justify-center overflow-hidden bg-gradient-to-br ${t.accent.bgFrom} via-white ${t.accent.bgVia}`}
        >
          {/* soft decor dots */}
          <div className="absolute inset-0 opacity-[0.10]" aria-hidden>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`pat-${t.id}`} width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill={t.accent.bright} />
               </pattern>
             </defs>
              <rect width="100%" height="100%" fill={`url(#pat-${t.id})`} />
           </svg>
         </div>

          {/* corner bracket marks (medical-clean motif) */}
          <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-slate-300" />
          <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-slate-300" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-slate-300" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-slate-300" />

          {/* hero SVG */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative z-10">
            <Hero keyName={t.heroKey} active={active} color={t.accent.bright} />
         </div>

          {/* category badge top-right */}
          <div
            className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md
                        text-[10px] font-extrabold uppercase tracking-[0.14em]
                        ${t.accent.pill} ${t.accent.pillFg}`}
            style={{
              transform: active ? 'scale(1)' : 'scale(0.6)',
              opacity: active ? 1 : 0,
              transition: `transform 0.4s cubic-bezier(0.34,1.56,0.7,1) ${delay + 300}ms, opacity 0.2s ease ${delay + 300}ms`,
            }}
          >
            <HeartPulse size={10} strokeWidth={3} />
            Specialty
         </div>
       </div>

        {/* Body */}
        <div className="p-5 pt-4 flex flex-col gap-3">
          {/* icon + title */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-[10.5px] font-bold uppercase tracking-[0.14em] ${t.accent.text}`}>
                {t.subtitle}
             </p>
              <h3 className="mt-1 text-[16px] font-extrabold text-navy leading-snug group-hover:text-primary transition-colors">
                {t.title}
             </h3>
           </div>
            <span
              className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-50
                          border border-border flex items-center justify-center
                          ${t.accent.text}
                          group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300
                          shadow-sm`}
            >
              <Icon size={17} strokeWidth={2.2} />
           </span>
         </div>

          {/* blurb */}
          <p className="text-[12.5px] text-text-secondary leading-relaxed">
            {t.blurb}
         </p>

          {/* highlights list */}
          <ul className="mt-1 space-y-1.5">
            {t.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-[11.5px] text-text-primary"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateX(0)' : 'translateX(-6px)',
                  transition: `opacity 0.5s ease ${delay + 400 + i * 80}ms, transform 0.5s ease ${delay + 400 + i * 80}ms`,
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: t.accent.bright }}
                />
                {h}
             </li>
            ))}
         </ul>

          {/* hover ECG underline */}
          <div className="mt-2 -mx-1">
            <ECGHoverLine color={t.accent.bright} />
         </div>
       </div>
     </div>
   </Reveal>
  )
}

/* ── CTA strip at bottom ─────────────────────────────────────────── */
function TalkStrip({ active }: { active: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl gradient-dark text-white"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.98)',
        transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 250ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) 250ms',
      }}
    >
      {/* decor */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -right-8 -top-14 w-56 h-56 rounded-full bg-cyan/20 blur-[60px]" />
        <div className="absolute -left-10 -bottom-12 w-56 h-56 rounded-full bg-green/20 blur-[60px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ctaDots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.2" fill="#ffffff" />
           </pattern>
         </defs>
          <rect width="100%" height="100%" fill="url(#ctaDots)" />
       </svg>
     </div>

      <div className="container-max px-6 md:px-12 py-9 md:py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-7">
          {/* pulsing heart */}
          <div className="shrink-0 anim-heartbeat w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-[0_6px_28px_rgba(24,184,230,0.35)]">
            <HeartPulse size={30} strokeWidth={2.2} />
         </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] tracking-[0.2em] uppercase text-cyan-100 font-bold mb-1">
              Not sure which one you need?
           </p>
            <h3 className="text-xl md:text-3xl font-extrabold leading-tight">
              Talk to a cardiologist first.{' '}
              <span className="shimmer-text">We&rsquo;ll route you</span>
           </h3>
            <p className="text-white/70 text-sm mt-2 max-w-md mx-auto md:mx-0">
              A 15-minute consult is often enough to know exactly which specialty your case needs.
           </p>
         </div>

          <Link
            href="/appointment"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white text-navy hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
          >
            <Calendar size={15} />
            Book a consult
            <ArrowRight size={15} />
         </Link>
       </div>
     </div>
   </div>
  )
}

/* ── Main section ───────────────────────────────────────────────── */
export default function CardiologyTypesSection() {
  // Signature effect: cards settle out of a 3D tilt, header eases down to size.
  const { ref, visible, direction } = useVisible(0.05)

  return (
    <section ref={ref} className="py-10 md:py-12 bg-bg relative overflow-hidden">
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-primary/5 blur-[110px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-cyan/5 blur-[90px]" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-green/5 blur-[90px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ctDots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#1565D8" />
           </pattern>
         </defs>
          <rect width="100%" height="100%" fill="url(#ctDots)" />
       </svg>
     </div>

      <div className="container-max px-4 md:px-8 relative z-10">
        {/* ── Header ── */}
        <Reveal
          effect="zoom-out"
          visible={visible}
          direction={direction}
          className="text-center max-w-3xl mx-auto mb-7 md:mb-8"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
           </span>
            The Six Pillars of Cardiac Care
         </div>

          <h2 className="text-2xl md:text-4xl lg:text-[2.6rem] font-extrabold text-navy leading-tight tracking-tight">
            Types of{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-primary)' }}
            >
              Cardiology
           </span>
         </h2>

          <div className="my-4 max-w-md mx-auto">
            <ECGHeader active={visible} color="#1565D8" />
         </div>

          <p className="text-text-secondary text-base md:text-lg leading-relaxed">
            Heart medicine is a deep field. Each branch trains for a different problem — here is
            every specialty you might meet, in plain language.
         </p>
       </Reveal>

        {/* ── Card grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {TYPES.map((t, i) => (
            <TypeCard key={t.id} t={t} index={i} active={visible} direction={direction} />
          ))}
       </div>

        {/* ── Talk-to-cardio CTA ── */}
        <div className="mt-8 md:mt-9">
          <TalkStrip active={visible} />
       </div>
     </div>
   </section>
  )
}
