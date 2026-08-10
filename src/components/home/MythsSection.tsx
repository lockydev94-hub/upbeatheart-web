/**
 * MythsSection — "Myths about Congenital Heart Disease"
 *
 * Design concept: "Myth-Busters board". Four misconception cards,
 * each stamped with a slam-in "MYTH" badge so the visitor instantly
 * knows the claim is wrong. The section opens with an ECG trace that
 * draws itself, cards stagger in with a flip-and-rise motion, then the
 * section closes on a dark pulsing "Important Message" banner that
 * visually treats the message like an EKG alarm going off.
 *
 * Animation layers (all triggered by IntersectionObserver):
 *  1. Header fades + slides, ECG decor line draws left → right
 *  2. Myth cards flip up + in, staggered
 *  3. "MYTH" stamp slams + rotates onto each card (spring scale)
 *  4. Floating red pulse rings orbit the Important Message heart
 *  5. "Never Neglect…" text shimmers with a traveling highlight
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Heart, HeartPulse, Stethoscope, Activity, X, ArrowRight, ShieldAlert,
} from 'lucide-react'

// ── Content (editable copy) ───────────────────────────────────────────────────
const MYTHS = [
  {
    icon: Stethoscope,
    title: 'Not every cardiologist treats every condition',
    body: 'Congenital heart disease needs a specialist who understands CHD — not every cardiac doctor treats it.',
  },
  {
    icon: Heart,
    title: 'All holes in the heart close on their own',
    body: 'Some defects never close and silently damage the heart over time. Only a doctor can say if one will.',
  },
  {
    icon: Activity,
    title: 'CHD only affects children',
    body: 'Thousands of adults live with congenital defects. Care does not stop when childhood does.',
  },
  {
    icon: HeartPulse,
    title: 'High cholesterol only affects adults',
    body: 'Cholesterol problems can quietly begin young — and high cholesterol is only one of many heart-disease risk factors.',
  },
]

// ── Helpers ─────────────────────────────────────────────────────────────────
function useVisible(threshold = 0.1) {
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

// ── Animated ECG line ──────────────────────────────────────────────────────
function ECGLine({ active, color = '#18B8E6' }: { active: boolean; color?: string }) {
  const path = 'M0,22 L28,22 L36,22 L44,8 L50,38 L57,4 L64,34 L72,22 L80,22 L96,22 L102,22 L108,10 L114,32 L120,6 L126,34 L132,22 L140,22 L160,22 L168,22 L176,12 L182,30 L188,8 L194,32 L200,22 L208,22 L240,22 L280,22'
  const len = 320
  return (
    <svg viewBox="0 0 280 44" className="w-full h-10" aria-hidden>
      <polyline points={path} fill="none" stroke={color} strokeWidth="1.4" opacity="0.14" />
      <polyline
        points={path}
        fill="none" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={active ? 0 : len}
        style={{
          transition: active ? 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1) 0.25s' : 'none',
          filter: `drop-shadow(0 0 4px ${color}99)`,
        }}
      />
      {active && (
        <circle r="3.2" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
          <animateMotion
            path={`M 0,22 L 28,22 L 36,22 L 44,8 L 50,38 L 57,4 L 64,34 L 72,22 L 80,22 L 96,22 L 102,22 L 108,10 L 114,32 L 120,6 L 126,34 L 132,22 L 140,22 L 160,22 L 168,22 L 174,12 L 182,30 L 188,8 L 194,32 L 200,22 L 220,22 L 280,22`}
            dur="2.4s"
            repeatCount="indefinite"
            begin="1.4s"
          />
        </circle>
      )}
    </svg>
  )
}

// ── Myth card ──────────────────────────────────────────────────────────────
function MythCard({ myth, index, active }: {
  myth: typeof MYTHS[number]
  index: number
  active: boolean
}) {
  const Icon = myth.icon
  const delay = 120 + index * 140

  return (
    <div
      className="group relative"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(44px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
    >
      <div className="relative h-full rounded-2xl border border-border bg-white overflow-hidden shadow-[0_2px_12px_rgba(21,101,216,0.07)] hover:shadow-[0_12px_40px_rgba(21,101,216,0.15)] hover:-translate-y-1.5 hover:border-primary/25 transition-all duration-300">

        {/* Top ECG accent */}
        <ECGLine active={active} color="#18B8E6" />

        <div className="p-5 pt-2 flex flex-col gap-3.5">

          {/* Stamp + icon row */}
          <div className="flex items-start justify-between">
            <span
              className="inline-flex items-center bg-primary text-white text-[10px] font-extrabold uppercase tracking-[0.18em] px-2.5 py-1 rounded-md shadow-[0_4px_14px_rgba(21,101,216,0.35)]"
              style={{
                transform: active ? 'rotate(-3deg) scale(1)' : 'rotate(0deg) scale(2.4)',
                opacity: active ? 1 : 0,
                transition: `transform 0.45s cubic-bezier(0.34,1.56,0.7,1) ${delay + 200}ms, opacity 0.2s ease ${delay + 200}ms`,
              }}
            >
              <X size={11} strokeWidth={3} className="mr-1" />
              MYTH
            </span>
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Icon size={20} />
            </span>
          </div>

          {/* Copy */}
          <h3 className="text-[15px] font-extrabold text-navy leading-snug group-hover:text-primary transition-colors">
            {myth.title}
          </h3>
          <p className="text-[12.5px] text-text-secondary leading-relaxed">
            {myth.body}
          </p>

          {/* Bottom deco */}
          <div className="pt-1 mt-auto flex items-center gap-2">
            <Heart size={12} fill="#18B55A" stroke="none" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-primary/60 font-bold">
              Debunked by cardiology
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Important Message banner ───────────────────────────────────────────────
function ImportantMessage({ active }: { active: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl gradient-dark text-white"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0) scale(1)' : 'translateY(34px) scale(0.97)',
        transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 300ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) 300ms',
      }}
      role="alert"
    >
      {/* Pulsing alarm rings */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-cyan opacity-15" />
            <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-cyan opacity-20 [animation-delay:0.5s]" />
          </div>
        </div>
        {/* Floating glow blobs */}
        <div className="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-green/20 blur-[70px]" />
        <div className="absolute -left-10 -bottom-16 w-64 h-64 rounded-full bg-primary/20 blur-[70px]" />
      </div>

      <div className="container-max px-6 md:px-12 py-10 md:py-14 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Pulsing heart */}
          <div className="shrink-0 relative" style={{ opacity: active ? 1 : 0, transform: active ? 'none' : 'scale(0.5)', transition: 'opacity 0.6s ease 500ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 500ms' }}>
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center anim-heartbeat shadow-[0_8px_32px_rgba(24,184,230,0.35)]">
              <Heart size={36} fill="#57D66E" stroke="#E7FFF0" strokeWidth={2.2} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan/20 border border-cyan/40 text-cyan-100 text-[11px] font-bold uppercase tracking-widest mb-4">
              <ShieldAlert size={12} className="anim-heartbeat" />
              Important Message
            </div>
            <h3
              className="text-2xl md:text-4xl font-extrabold leading-[1.15] tracking-tight"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? 'none' : 'translateY(24px)',
                transition: 'opacity 0.6s ease 700ms, transform 0.6s ease 700ms',
              }}
            >
              Never Neglect A{' '}
              <span className="relative inline-block mt-1">
                <span className="shimmer-text">Congenital Heart Disease</span>
                <span
                  className="absolute left-0 right-0 -bottom-1 h-0.5 rounded"
                  style={{
                    background: 'linear-gradient(90deg,#18B8E6,#1565D8,#18B55A)',
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1) 900ms',
                  }}
                />
              </span>
            </h3>
            <p
              className="text-white/70 text-sm md:text-base mt-4 max-w-lg mx-auto md:mx-0 leading-relaxed"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? 'none' : 'translateY(16px)',
                transition: 'opacity 0.6s ease 850ms, transform 0.6s ease 850ms',
              }}
            >
              Don&rsquo;t assume, don&rsquo;t wait — and never ignore unusual
              symptoms, even if they come and go. Your heart is worth the asking.
            </p>

            {/* CTA row */}
            <div
              className="flex flex-wrap justify-center md:justify-start gap-3 mt-6"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? 'none' : 'translateY(14px)',
                transition: 'opacity 0.6s ease 950ms, transform 0.6s ease 950ms',
              }}
            >
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white text-navy hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
              >
                Talk to a Cardiologist
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/diseases"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-white/30 text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
              >
                Learn About CHD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main section ───────────────────────────────────────────────────────────
export default function MythsSection() {
  const { ref, visible } = useVisible(0.06)

  return (
    <section ref={ref} className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-primary/5 blur-[90px]" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-green/5 blur-[90px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mythDots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#1565D8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mythDots)" />
        </svg>
      </div>

      <div className="container-max px-4 md:px-8 relative z-10">
        {/* ── Header ── */}
        <div
          className="text-center max-w-3xl mx-auto mb-12 md:mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(28px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Debunking Heart Myths
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-[2.6rem] font-extrabold text-navy leading-tight tracking-tight">
            Myths{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-primary)' }}
            >
              About Congenital Heart
            </span>
            {' '}Disease
          </h2>

          <p className="text-text-secondary text-base md:text-lg leading-relaxed mt-4">
            Believing a myth can be as dangerous as the disease itself. Here are
            the most common ones — so you can tell fact from fiction.
          </p>
        </div>

        {/* ── Myth cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {MYTHS.map((myth, i) => (
            <MythCard key={i} myth={myth} index={i} active={visible} />
          ))}
        </div>

        {/* ── Important Message ── */}
        <div className="mt-12 md:mt-16">
          <ImportantMessage active={visible} />
        </div>
      </div>
    </section>
  )
}