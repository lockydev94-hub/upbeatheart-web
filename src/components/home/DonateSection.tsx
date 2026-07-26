/**
 * DonateSection — "Support a Heart" home page section
 *
 * Design concept: An animated donation flow that shows the journey from
 * donor → rupees flow → patient receives care. The section uses a
 * split layout: left is the animated flow visualiser (the signature
 * element), right is the donation methods. On mobile the flow collapses
 * to a stats strip above the cards.
 *
 * Animation strategy:
 *  - IntersectionObserver triggers everything when the section enters view
 *  - SVG animated dashes simulate money flowing through the path
 *  - Counter numbers count up from 0 to their target
 *  - Cards stagger in with translate + opacity
 *  - Heartbeat pulse on the heart icon (CSS keyframe via inline style)
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Heart, Smartphone, Building2, IndianRupee,
  ArrowRight, Users, TrendingUp, ShieldCheck, Sparkles,
} from 'lucide-react'
import type { SiteSettings } from '@/types/firestore'

interface Props { settings: SiteSettings }

// ── Animated counter hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active || target === 0) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return val
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon, value, label, delay, visible,
}: {
  icon: React.ReactNode
  value: string
  label: string
  delay: number
  visible: boolean
}) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
      className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3"
    >
      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white font-extrabold text-lg leading-none">{value}</p>
        <p className="text-white/55 text-[11px] mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  )
}

// ── Donation method card ─────────────────────────────────────────────────────
function DonateCard({
  href, icon, title, sub, cta, delay, visible, accent = false,
}: {
  href: string
  icon: React.ReactNode
  title: string
  sub: string
  cta: string
  delay: number
  visible: boolean
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
      className={`group relative flex items-start gap-4 rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
        accent
          ? 'bg-white text-[#143B7D] border-white/80 shadow-lg'
          : 'bg-white/10 hover:bg-white/18 border-white/20 hover:border-white/40'
      }`}
    >
      {/* icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
        accent ? 'bg-[#1565D8]/10' : 'bg-white/15'
      }`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`font-bold text-sm leading-tight ${accent ? 'text-[#143B7D]' : 'text-white'}`}>
          {title}
        </p>
        <p className={`text-xs mt-0.5 truncate ${accent ? 'text-[#6B7280]' : 'text-white/55'}`}>
          {sub}
        </p>
        <p className={`text-xs font-semibold mt-2.5 flex items-center gap-1 transition-all duration-200 group-hover:gap-2 ${
          accent ? 'text-[#1565D8]' : 'text-[#7DD3FC]'
        }`}>
          {cta}
          <ArrowRight size={10} />
        </p>
      </div>

      {/* hover shimmer */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  )
}

// ── Flow diagram — the signature animated element ────────────────────────────
function DonationFlowDiagram({ visible }: { visible: boolean }) {
  // The diagram shows: Donor → Rupees flow (SVG path) → Heart (patient)
  // Animated SVG stroke-dashoffset creates the "money flowing" effect

  const [pathLen, setPathLen] = useState(0)
  const pathRef = useRef<SVGPathElement>(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength())
  }, [])

  // Once visible, trigger the heart pulse after the flow reaches it
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setPulse(true), 1800)
      return () => clearTimeout(t)
    }
  }, [visible])

  const steps = [
    { label: 'You Donate', icon: '🤲', color: '#7DD3FC', y: 50 },
    { label: 'Verified &\nAllocated',  icon: '✅', color: '#86EFAC', y: 160 },
    { label: 'Patient\nReceives Care', icon: '🏥', color: '#FCA5A5', y: 270 },
  ]

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-32px)',
        transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s',
      }}
      className="relative w-full max-w-[320px] mx-auto lg:mx-0 select-none"
    >
      <svg
        viewBox="0 0 280 340"
        className="w-full"
        aria-hidden="true"
      >
        <defs>
          {/* Glow filter for the flow path */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Rupee particle gradient */}
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#7DD3FC" stopOpacity="0.9"/>
            <stop offset="50%"  stopColor="#86EFAC" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0.7"/>
          </linearGradient>

          {/* Soft radial for node backgrounds */}
          <radialGradient id="nodeBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.25)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)"/>
          </radialGradient>
        </defs>

        {/* ── Background decorative circles ── */}
        <circle cx="240" cy="30"  r="40" fill="rgba(255,255,255,0.03)"/>
        <circle cx="20"  cy="300" r="30" fill="rgba(255,255,255,0.03)"/>

        {/* ── Flow path (the tube money travels through) ── */}
        <path
          d="M 100 70 C 100 120, 160 120, 160 160 C 160 200, 100 200, 100 250"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Animated flow line */}
        <path
          ref={pathRef}
          d="M 100 70 C 100 120, 160 120, 160 160 C 160 200, 100 200, 100 250"
          fill="none"
          stroke="url(#flowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={pathLen || 300}
          strokeDashoffset={visible ? 0 : pathLen || 300}
          filter="url(#glow)"
          style={{
            transition: pathLen
              ? `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1) 0.4s`
              : 'none',
          }}
        />

        {/* Animated rupee particles travelling along the path */}
        {visible && pathLen > 0 && [0, 0.33, 0.66].map((offset, i) => (
          <g key={i}>
            <circle r="5" fill="#7DD3FC" opacity="0.85" filter="url(#glow)">
              <animateMotion
                dur="2.2s"
                begin={`${i * 0.55}s`}
                repeatCount="indefinite"
                path="M 100 70 C 100 120, 160 120, 160 160 C 160 200, 100 200, 100 250"
              />
            </circle>
            {/* ₹ text riding along the path */}
            <text fontSize="8" fill="white" opacity="0.7" textAnchor="middle" dominantBaseline="middle">
              <animateMotion
                dur="2.2s"
                begin={`${i * 0.55}s`}
                repeatCount="indefinite"
                path="M 100 70 C 100 120, 160 120, 160 160 C 160 200, 100 200, 100 250"
              />
              ₹
            </text>
          </g>
        ))}

        {/* ── Step nodes ── */}
        {steps.map((step, i) => {
          const x = i === 1 ? 160 : 100
          const y = step.y
          const isLast = i === steps.length - 1
          const nodeDelay = 0.3 + i * 0.4

          return (
            <g key={i}>
              {/* Outer glow ring */}
              <circle
                cx={x} cy={y} r={isLast ? 34 : 28}
                fill="none"
                stroke={step.color}
                strokeWidth="1"
                opacity="0.3"
                style={{
                  opacity: visible ? 0.3 : 0,
                  transition: `opacity 0.4s ease ${nodeDelay + 0.1}s`,
                }}
              />
              {/* Node background */}
              <circle
                cx={x} cy={y} r={isLast ? 28 : 22}
                fill="url(#nodeBg)"
                stroke={step.color}
                strokeWidth="1.5"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: `scale(${visible ? 1 : 0.4})`,
                  transformOrigin: `${x}px ${y}px`,
                  transition: `opacity 0.5s ease ${nodeDelay}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${nodeDelay}s`,
                }}
              />
              {/* Emoji */}
              <text
                x={x} y={y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={isLast ? "18" : "14"}
                style={{
                  opacity: visible ? 1 : 0,
                  transition: `opacity 0.4s ease ${nodeDelay + 0.15}s`,
                }}
              >
                {step.icon}
              </text>

              {/* Heart pulse animation on the last node */}
              {isLast && pulse && (
                <>
                  <circle cx={x} cy={y} r="28" fill="none" stroke={step.color} strokeWidth="2">
                    <animate attributeName="r"     values="28;50;28" dur="1.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx={x} cy={y} r="28" fill="none" stroke={step.color} strokeWidth="1">
                    <animate attributeName="r"     values="28;42;28" dur="1.8s" begin="0.4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="1.8s" begin="0.4s" repeatCount="indefinite"/>
                  </circle>
                </>
              )}

              {/* Label — sits to the right of nodes 0,2; left of node 1 */}
              <foreignObject
                x={i === 1 ? x + 36 : x + 30}
                y={y - 16}
                width="90"
                height="38"
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: step.color,
                    lineHeight: '1.35',
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.4s ease ${nodeDelay + 0.2}s`,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {step.label}
                </div>
              </foreignObject>
            </g>
          )
        })}

        {/* ── Side label: "Your Impact" ── */}
        <text
          x="14" y="170"
          fill="rgba(255,255,255,0.2)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="2"
          writingMode="vertical-lr"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 1.2s',
          }}
        >
          YOUR IMPACT
        </text>

        {/* ── Trust badge bottom-right ── */}
        <g
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease 1.6s',
          }}
        >
          <rect x="168" y="290" width="98" height="34" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          <text x="185" y="304" fill="#86EFAC" fontSize="8" fontWeight="700">✓ 100%</text>
          <text x="185" y="316" fill="rgba(255,255,255,0.5)" fontSize="7">Tax-deductible</text>
        </g>
      </svg>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────────
export default function DonateSection({ settings }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible]     = useState(false)
  const [statsVisible, setStats]  = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          setTimeout(() => setStats(true), 300)
          obs.disconnect()
        }
      },
      { threshold: 0.06 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!settings.donationEnabled) return null

  const hasRazorpay = !!settings.razorpayKeyId
  const hasUpi      = !!settings.upiId
  const hasBank     = !!settings.bankAccountNumber

  // Donation method cards — first card gets the accent (white) treatment
  const methods = [
    hasRazorpay && {
      href: '/donate#online',
      icon: <IndianRupee size={20} className="text-[#1565D8]" />,
      title: 'Pay Online',
      sub: 'Cards · Net Banking · Wallets',
      cta: 'Donate securely',
      accent: true,
    },
    hasUpi && {
      href: '/donate#upi',
      icon: <Smartphone size={20} className="text-white" />,
      title: 'UPI Transfer',
      sub: settings.upiId || 'Scan QR or copy ID',
      cta: 'Scan & pay',
      accent: false,
    },
    hasBank && {
      href: '/donate#bank',
      icon: <Building2 size={20} className="text-white" />,
      title: 'Bank Transfer',
      sub: 'NEFT · RTGS · IMPS',
      cta: 'View account details',
      accent: false,
    },
    !hasRazorpay && !hasUpi && !hasBank && settings.chequePayableTo && {
      href: '/donate#cheque',
      icon: <IndianRupee size={20} className="text-[#1565D8]" />,
      title: 'Cheque / DD',
      sub: `Pay to: ${settings.chequePayableTo}`,
      cta: 'View details',
      accent: true,
    },
  ].filter(Boolean) as {
    href: string; icon: React.ReactNode; title: string
    sub: string; cta: string; accent: boolean
  }[]

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: 'linear-gradient(135deg, #0f2d6b 0%, #1565D8 50%, #166534 100%)' }}
    >
      {/* ── Background texture — very subtle dot grid ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg width="100%" height="100%" opacity="0.04">
          <defs>
            <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.2" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>

      {/* ── Ambient blobs ── */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #18B8E6 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }} />

      <div className="container-max px-4 md:px-8 relative z-10">

        {/* ── Section eyebrow ── */}
        <div
          className="flex justify-center mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(-16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest">
            <Heart size={11} className="text-red-300 fill-red-300" style={{
              animation: visible ? 'hb 1.1s ease-in-out infinite' : 'none',
            }}/>
            Support a Heart
          </div>
        </div>

        {/* ── Main two-column layout ── */}
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">

          {/* ── LEFT: Flow diagram ── */}
          <div className="flex flex-col items-center lg:items-start">
            <div
              className="mb-8 text-center lg:text-left"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
              }}
            >
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
                Every Rupee<br />
                <span style={{ color: '#7DD3FC' }}>Reaches a Heart</span>
              </h2>
              <p className="text-white/65 text-base leading-relaxed max-w-sm">
                Your donation flows directly to verified cardiac patients
                who cannot afford treatment. Watch how it works.
              </p>
            </div>

            {/* Flow diagram */}
            <DonationFlowDiagram visible={visible} />

            {/* Stats row — below the diagram */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
              <StatPill
                icon={<Users size={16} className="text-[#7DD3FC]" />}
                value="500+"
                label="Patients helped"
                delay={600}
                visible={statsVisible}
              />
              <StatPill
                icon={<ShieldCheck size={16} className="text-[#86EFAC]" />}
                value="100%"
                label="Verified & safe"
                delay={750}
                visible={statsVisible}
              />
              <StatPill
                icon={<TrendingUp size={16} className="text-[#FCA5A5]" />}
                value="₹0 Fee"
                label="No platform cut"
                delay={900}
                visible={statsVisible}
              />
            </div>
          </div>

          {/* ── RIGHT: Donation cards + CTA ── */}
          <div className="flex flex-col gap-4">

            {/* Header */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(24px)',
                transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
              }}
            >
              <p className="text-[#7DD3FC] text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles size={10} /> Choose how to give
              </p>
              <h3 className="text-white text-xl font-extrabold">
                Donate in seconds, <br className="hidden sm:block"/>secure & tax-deductible
              </h3>
            </div>

            {/* Method cards */}
            <div className="flex flex-col gap-3 mt-2">
              {methods.map((m, i) => (
                <DonateCard
                  key={m.href}
                  {...m}
                  delay={350 + i * 120}
                  visible={visible}
                />
              ))}
            </div>

            {/* Primary CTA */}
            <div
              className="mt-4 flex flex-col sm:flex-row items-center gap-3"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(16px)',
                transition: 'opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s',
              }}
            >
              <Link
                href="/donate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-white text-[#143B7D] hover:bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <Heart size={17} className="text-red-500 fill-red-500" />
                Donate Now
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/patient-assistance"
                className="text-white/65 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
              >
                See who you&rsquo;ll help →
              </Link>
            </div>

            {/* Trust footnote */}
            <div
              className="flex items-center gap-2 mt-2"
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s ease 0.9s',
              }}
            >
              <ShieldCheck size={13} className="text-[#86EFAC] shrink-0" />
              <p className="text-white/40 text-[11px]">
                80G tax exemption · Doctor-verified campaigns · Secure payment gateway
              </p>
            </div>

            {settings.donationNote && (
              <p className="text-white/35 text-[11px] italic mt-1">{settings.donationNote}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Heartbeat keyframe injected as a style tag ── */}
      <style>{`
        @keyframes hb {
          0%, 100% { transform: scale(1); }
          14%       { transform: scale(1.3); }
          28%       { transform: scale(1); }
          42%       { transform: scale(1.2); }
          70%       { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes hb { 0%, 100% { transform: scale(1); } }
        }
      `}</style>
    </section>
  )
}
