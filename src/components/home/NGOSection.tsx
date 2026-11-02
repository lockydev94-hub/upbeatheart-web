/**
 * NGOSection — "NGO Collaboration" home page section
 *
 * Design: bg stays #F8FAFC (bg-bg). The signature animated element is a
 * "network pulse" SVG — nodes representing the doctor, NGOs, and patients
 * connected by animated lines that pulse outward, showing how joining the
 * network creates ripples of care. On scroll-in:
 *
 *  1. Connection lines draw themselves (strokeDashoffset → 0)
 *  2. Nodes pop in with spring scale
 *  3. Ripple rings expand from each node on a staggered loop
 *  4. Benefit cards stagger in from the left
 *  5. NGO logo cards arrive from the right with wave timing
 *  6. Stat counters tick up when they enter the viewport
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Handshake, ArrowRight, Globe, Users, Heart,
  Building2, CheckCircle2, TrendingUp, MapPin,
} from 'lucide-react'
import type { NGO } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'
import useScrollReveal, { type ScrollDirection } from '@/hooks/useScrollReveal'
import Reveal from '@/components/ui/Reveal'

interface Props { ngos: NGO[] }

// ── Intersection hook ─────────────────────────────────────────────────────────
/**
 * Replaying scroll trigger. `eagerness` is how far into the viewport the element
 * must travel before it fires, as a fraction of viewport height.
 */
function useVisible(eagerness = 0.07) {
  return useScrollReveal<HTMLDivElement>({ offset: eagerness })
}

// ── Counter hook ──────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1600, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active || target === 0) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return val
}

// ── Animated stat ─────────────────────────────────────────────────────────────
function StatBadge({ target, suffix, label, icon: Icon, color, active, delay }: {
  target: number; suffix: string; label: string
  icon: React.ElementType; color: string; active: boolean; delay: number
}) {
  const val = useCounter(target, 1600, active)
  return (
    <div
      className="flex items-center gap-3 bg-white border border-border rounded-2xl px-4 py-3 shadow-sm"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-extrabold text-navy leading-none">
          {val}<span className="text-primary text-base">{suffix}</span>
        </p>
        <p className="text-[10px] text-text-secondary font-semibold mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── NGO Card ──────────────────────────────────────────────────────────────────
function NGOCard({ ngo, delay, visible, direction }: {
  ngo: NGO; delay: number; visible: boolean; direction: ScrollDirection
}) {
  return (
    <Reveal effect="zoom-in" delay={delay} visible={visible} direction={direction}>
      <Link
        href="/ngo"
        className="group relative flex flex-col items-center gap-2.5 p-4 h-full rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-[0_6px_24px_rgba(21,101,216,0.12)] transition-all duration-300 hover:-translate-y-1"
      >
        <span className="absolute top-2 right-2">
          <CheckCircle2 size={12} className="text-green" />
        </span>
        {ngo.logoUrl ? (
          <div className="relative h-10 w-20 overflow-hidden">
            <LazyImage
              src={ngo.logoUrl} alt={ngo.name} revealBlur
              className="absolute inset-0 w-full h-full object-contain grayscale group-hover:grayscale-0 opacity-55 group-hover:opacity-100 transition-all duration-300"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center">
            <Building2 size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
          </div>
        )}
        <p className="text-[10px] font-bold text-text-secondary group-hover:text-navy transition-colors text-center leading-tight line-clamp-2">
          {ngo.name}
        </p>
        {ngo.description && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-navy text-white text-[10px] rounded-xl px-3 py-2 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
            <p className="font-bold mb-0.5 text-[11px]">{ngo.name}</p>
            <p className="text-white/70 line-clamp-3">{ngo.description}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy" />
          </div>
        )}
      </Link>
    </Reveal>
  )
}

// ── Network pulse diagram — signature element ─────────────────────────────────
function NetworkDiagram({ visible, ngoCount }: { visible: boolean; ngoCount: number }) {
  const pathsRef = useRef<SVGPathElement[]>([])

  // Center = doctor hub, satellites = NGOs, bottom = patients
  // Layout in a 320×300 viewBox
  const cx = 160; const cy = 130

  // 5 NGO satellite nodes arranged in a semicircle (top half)
  const ngoNodes = [
    { x: 60,  y: 45,  label: 'Health\nCamp',   color: '#1565D8' },
    { x: 130, y: 22,  label: 'Awareness\nDrive', color: '#18B8E6' },
    { x: 200, y: 22,  label: 'Referral\nNetwork', color: '#18B55A' },
    { x: 265, y: 55,  label: 'Funding\nSupport', color: '#143B7D' },
    { x: 42,  y: 110, label: 'Community\nReach',  color: '#7C3AED' },
  ]

  // 3 Patient nodes at the bottom
  const patientNodes = [
    { x: 95,  y: 250, icon: '❤️' },
    { x: 160, y: 265, icon: '🏥' },
    { x: 228, y: 250, icon: '👤' },
  ]

  return (
    <div
      className="relative w-full max-w-[340px] mx-auto"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease 0.1s',
      }}
    >
      <svg viewBox="0 0 320 300" className="w-full" aria-hidden>
        <defs>
          {/* Glow */}
          <filter id="nglow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Subtle node shadow */}
          <filter id="nshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1565D8" floodOpacity="0.18"/>
          </filter>
          {/* Animated gradient for connection lines */}
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1565D8" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#18B8E6" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#18B55A" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#143B7D" stopOpacity="0.3"/>
          </linearGradient>
        </defs>

        {/* ── Background concentric rings (subtle) ── */}
        {[55, 95, 135].map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke="#1565D8" strokeWidth="0.5"
            opacity={visible ? 0.07 : 0}
            style={{ transition: `opacity 0.6s ease ${0.3 + i * 0.15}s` }}
          />
        ))}

        {/* ── NGO → Doctor connection lines ── */}
        {ngoNodes.map((n, i) => {
          const len = Math.hypot(n.x - cx, n.y - cy)
          return (
            <line key={`nl-${i}`}
              x1={n.x} y1={n.y} x2={cx} y2={cy}
              stroke="url(#lineGrad1)" strokeWidth="1.5"
              strokeDasharray={len} strokeDashoffset={visible ? 0 : len}
              style={{ transition: `stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.1}s` }}
            />
          )
        })}

        {/* ── Doctor → Patient connection lines ── */}
        {patientNodes.map((p, i) => {
          const len = Math.hypot(p.x - cx, p.y - cy)
          return (
            <line key={`pl-${i}`}
              x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke="url(#lineGrad2)" strokeWidth="1.5" strokeLinecap="round"
              strokeDasharray={len} strokeDashoffset={visible ? 0 : len}
              style={{ transition: `stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1) ${0.7 + i * 0.12}s` }}
            />
          )
        })}

        {/* ── Animated signal dots travelling along lines ── */}
        {visible && ngoNodes.map((n, i) => (
          <circle key={`sig-${i}`} r="3" fill={n.color} opacity="0.9" filter="url(#nglow)">
            <animateMotion
              dur={`${1.8 + i * 0.3}s`}
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
              path={`M ${n.x} ${n.y} L ${cx} ${cy}`}
            />
          </circle>
        ))}

        {/* Signal dots from doctor → patients */}
        {visible && patientNodes.map((p, i) => (
          <circle key={`psig-${i}`} r="3" fill="#18B55A" opacity="0.9" filter="url(#nglow)">
            <animateMotion
              dur={`${1.6 + i * 0.25}s`}
              begin={`${0.5 + i * 0.35}s`}
              repeatCount="indefinite"
              path={`M ${cx} ${cy} L ${p.x} ${p.y}`}
            />
          </circle>
        ))}

        {/* ── NGO satellite nodes ── */}
        {ngoNodes.map((n, i) => (
          <g key={`nn-${i}`}>
            {/* Ripple ring */}
            {visible && (
              <circle cx={n.x} cy={n.y} r="14" fill="none" stroke={n.color} strokeWidth="1.5">
                <animate attributeName="r"       values="14;28;14" dur="2.4s" begin={`${i * 0.5}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" begin={`${i * 0.5}s`} repeatCount="indefinite"/>
              </circle>
            )}
            {/* Node bg */}
            <circle cx={n.x} cy={n.y} r="14"
              fill="white" stroke={n.color} strokeWidth="1.5"
              filter="url(#nshadow)"
              style={{
                opacity: visible ? 1 : 0,
                transform: `scale(${visible ? 1 : 0.3})`,
                transformOrigin: `${n.x}px ${n.y}px`,
                transition: `opacity 0.4s ease ${0.25 + i * 0.1}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.25 + i * 0.1}s`,
              }}
            />
            {/* Handshake icon (simplified) */}
            <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11"
              style={{ opacity: visible ? 1 : 0, transition: `opacity 0.3s ease ${0.35 + i * 0.1}s` }}>
              🤝
            </text>
            {/* Label */}
            <foreignObject
              x={i === 0 ? n.x - 52 : i === 4 ? n.x - 58 : n.x - 30}
              y={n.y + 17} width="64" height="28"
            >
              <div style={{
                fontSize: '8px', fontWeight: 700, color: n.color,
                lineHeight: '1.3', textAlign: 'center', whiteSpace: 'pre-line',
                opacity: visible ? 1 : 0,
                transition: `opacity 0.4s ease ${0.4 + i * 0.1}s`,
              }}>
                {n.label}
              </div>
            </foreignObject>
          </g>
        ))}

        {/* ── Centre doctor node ── */}
        <g>
          {/* Outer pulse rings */}
          {visible && [0, 0.6, 1.2].map((begin, i) => (
            <circle key={`cp-${i}`} cx={cx} cy={cy} r="26" fill="none" stroke="#1565D8" strokeWidth="1.5">
              <animate attributeName="r"       values="26;52;26" dur="2.8s" begin={`${begin}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.8s" begin={`${begin}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          {/* Node */}
          <circle cx={cx} cy={cy} r="26"
            fill="white" stroke="#1565D8" strokeWidth="2"
            filter="url(#nshadow)"
            style={{
              opacity: visible ? 1 : 0,
              transform: `scale(${visible ? 1 : 0.2})`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'opacity 0.5s ease 0.15s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s',
            }}
          />
          {/* Heart icon */}
          <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize="20"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease 0.4s' }}>
            🫀
          </text>
          {/* "Doctor Hub" label below */}
          <text x={cx} y={cy + 38} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#143B7D"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease 0.5s' }}>
            Doctor Hub
          </text>
        </g>

        {/* ── Patient nodes ── */}
        {patientNodes.map((p, i) => (
          <g key={`pn-${i}`}>
            {visible && (
              <circle cx={p.x} cy={p.y} r="16" fill="none" stroke="#18B55A" strokeWidth="1">
                <animate attributeName="r"       values="16;30;16" dur="2.2s" begin={`${0.8 + i * 0.4}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" begin={`${0.8 + i * 0.4}s`} repeatCount="indefinite"/>
              </circle>
            )}
            <circle cx={p.x} cy={p.y} r="16"
              fill="white" stroke="#18B55A" strokeWidth="1.5"
              filter="url(#nshadow)"
              style={{
                opacity: visible ? 1 : 0,
                transform: `scale(${visible ? 1 : 0.3})`,
                transformOrigin: `${p.x}px ${p.y}px`,
                transition: `opacity 0.5s ease ${0.8 + i * 0.15}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.8 + i * 0.15}s`,
              }}
            />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12"
              style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${0.9 + i * 0.15}s` }}>
              {p.icon}
            </text>
          </g>
        ))}

        {/* ── "Patients" label ── */}
        <text x={cx} y="292" textAnchor="middle" fontSize="8" fontWeight="700"
          fill="#18B55A"
          style={{ opacity: visible ? 0.8 : 0, transition: 'opacity 0.5s ease 1.2s' }}>
          Patients Reached
        </text>

        {/* ── NGO count badge top-right ── */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 1s' }}>
          <rect x="258" y="6" width="58" height="22" rx="8"
            fill="#1565D8" opacity="0.12" stroke="#1565D8" strokeWidth="0.8" strokeOpacity="0.3"/>
          <text x="287" y="18" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#1565D8">
            {ngoCount}+ NGOs
          </text>
        </g>
      </svg>
    </div>
  )
}

// ── Benefit card ──────────────────────────────────────────────────────────────
function BenefitCard({ icon: Icon, title, desc, color, accent, delay, visible, direction }: {
  icon: React.ElementType; title: string; desc: string
  color: string; accent: string; delay: number; visible: boolean; direction: ScrollDirection
}) {
  return (
    <Reveal effect="slide-left" delay={delay} visible={visible} direction={direction}>
      <div className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border hover:border-primary/25 hover:shadow-[0_4px_20px_rgba(21,101,216,0.10)] hover:-translate-y-0.5 transition-all duration-250">
        {/* Animated icon container */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200 ${color}`}
        >
          <Icon size={15} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-extrabold text-navy leading-tight">{title}</p>
          <p className="text-[12px] text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
        </div>
        {/* Right accent line that slides in on hover */}
        <div className={`ml-auto w-0.5 self-stretch rounded-full ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
      </div>
    </Reveal>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function NGOSection({ ngos }: Props) {
  // Signature effect: the whole network zooms into focus — header, then logos.
  const { ref, visible, direction } = useVisible(0.06)

  const displayNGOs   = ngos.slice(0, 9)
  const ngoCount      = ngos.length > 0 ? ngos.length : 30

  const benefits = [
    {
      icon: Users,       color: 'bg-primary',    accent: 'bg-primary',
      title: 'Community Health Camps',
      desc:  'Free cardiac screenings in underserved rural and urban areas.',
    },
    {
      icon: Globe,       color: 'bg-cyan',       accent: 'bg-cyan',
      title: 'Awareness Drives',
      desc:  'Heart health education programmes reaching thousands annually.',
    },
    {
      icon: Heart,       color: 'bg-green',      accent: 'bg-green',
      title: 'Patient Assistance',
      desc:  'NGO-sponsored funding for patients who cannot afford treatment.',
    },
    {
      icon: TrendingUp,  color: 'bg-[#143B7D]',  accent: 'bg-[#143B7D]',
      title: 'Referral Network',
      desc:  'Seamless specialist access via verified NGO partner channels.',
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-bg overflow-hidden">
      <div ref={ref} className="container-max px-4 md:px-8">

        {/* ── Section header ── */}
        <Reveal
          effect="zoom-in"
          visible={visible}
          direction={direction}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{ animation: visible ? 'pulse 1.5s ease-in-out infinite' : 'none' }}
            />
            NGO Collaboration
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-navy leading-tight tracking-tight">
            A Network Built{' '}
            <span className="text-primary">for Every Heart</span>
          </h2>
          <p className="text-text-secondary text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            When NGOs join our network, care travels further. Together we run health camps,
            fund treatments, and connect patients to specialists — reaching communities
            that would otherwise have no access.
          </p>
        </Reveal>

        {/* ── Three-column layout: benefits | diagram | NGO grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px_1fr] gap-10 xl:gap-12 items-center">

          {/* ── LEFT: Benefits + stats + CTAs ── */}
          <div className="space-y-4">

            {/* Benefit cards */}
            {benefits.map((b, i) => (
              <BenefitCard key={b.title} {...b} delay={200 + i * 90} visible={visible} direction={direction} />
            ))}

            {/* Stat row */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <StatBadge target={ngoCount} suffix="+" label="NGO Partners"    icon={Handshake} color="bg-primary" active={visible} delay={500} />
              <StatBadge target={50}       suffix="K+" label="Patients Reached" icon={Users}    color="bg-green"  active={visible} delay={620} />
              <StatBadge target={120}      suffix="+"  label="Health Camps"    icon={MapPin}    color="bg-cyan"   active={visible} delay={740} />
            </div>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 pt-1"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(12px)',
                transition: 'opacity 0.5s ease 700ms, transform 0.5s ease 700ms',
              }}
            >
              <Link
                href="/ngo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-primary shadow-[0_4px_20px_rgba(21,101,216,0.25)] hover:opacity-95 hover:-translate-y-0.5 transition-all"
              >
                <Handshake size={15} />
                Partner With Us
              </Link>
              <Link
                href="/ngo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-primary/25 text-primary hover:bg-primary hover:text-white transition-all"
              >
                View NGO Directory
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── CENTRE: Network pulse diagram ── */}
          <div
            className="hidden lg:flex flex-col items-center justify-center"
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.7s ease 0.15s',
            }}
          >
            <NetworkDiagram visible={visible} ngoCount={ngoCount} />

            {/* "How it works" micro-legend */}
            <div
              className="mt-4 flex flex-col gap-1.5 w-full"
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s ease 1.3s',
              }}
            >
              {[
                { color: '#1565D8', label: 'NGO joins network' },
                { color: '#18B8E6', label: 'Care flows to doctor hub' },
                { color: '#18B55A', label: 'Patients receive treatment' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-5 h-0.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[10px] text-text-secondary font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: NGO logo grid ── */}
          <div className="space-y-4">
            <div
              className="flex items-center justify-between"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(20px)',
                transition: 'opacity 0.5s ease 200ms, transform 0.5s ease 200ms',
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-secondary/60">
                Our Trusted Partners
              </p>
              <Link href="/ngo" className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1">
                See all <ArrowRight size={10} />
              </Link>
            </div>

            {displayNGOs.length === 0 ? (
              /* Skeleton placeholders */
              <div className="grid grid-cols-3 gap-2.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border-2 border-dashed border-border"
                    style={{
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.4s ease ${300 + i * 60}ms`,
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-border/50 animate-pulse" />
                    <div className="h-2 w-12 rounded-full bg-border/50 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {displayNGOs.map((ngo, i) => (
                  <NGOCard key={ngo.id} ngo={ngo} delay={300 + i * 55} visible={visible} direction={direction} />
                ))}
                {Array.from({ length: Math.max(0, 9 - displayNGOs.length) }).map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border-2 border-dashed border-border"
                    style={{
                      opacity: visible ? 0.5 : 0,
                      transition: `opacity 0.4s ease ${300 + (displayNGOs.length + i) * 55}ms`,
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-border/40" />
                    <div className="h-2 w-12 rounded-full bg-border/40" />
                  </div>
                ))}
              </div>
            )}

            {/* Verification trust strip */}
            <div
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-border shadow-sm"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(12px)',
                transition: 'opacity 0.5s ease 900ms, transform 0.5s ease 900ms',
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-extrabold text-navy leading-tight">All partners are verified</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Every NGO is reviewed by our team before listing.
                </p>
              </div>
            </div>

            {/* "Want to join?" CTA nudge — only on the NGO grid side */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/25 bg-primary/4"
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s ease 1050ms',
              }}
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Handshake size={13} className="text-primary" />
              </div>
              <p className="text-[11px] text-navy font-semibold flex-1">
                Is your NGO not listed?
              </p>
              <Link href="/ngo" className="text-[11px] font-bold text-primary hover:underline whitespace-nowrap flex items-center gap-0.5">
                Apply <ArrowRight size={9}/>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
