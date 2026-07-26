/**
 * CampaignHighlight — "Patient Assistance" home section
 *
 * Design concept: "Lifeline Cards" — each campaign card has an animated
 * ECG/heartbeat line across its header that pulses continuously, visually
 * communicating that this is a live, urgent situation. The progress bar
 * fills like a vital-signs monitor. A circular "radial progress" ring
 * around the percentage gives an at-a-glance read of how close the goal is.
 *
 * Animation layers (all triggered by IntersectionObserver):
 *  1. Section header fades + slides in
 *  2. Cards stagger in with spring scale from translateY
 *  3. ECG polyline draws itself via stroke-dashoffset on each card
 *  4. Progress bar fills from 0 → pct% after card is visible
 *  5. Radial ring sweeps around the percentage circle
 *  6. "Raised" counter ticks up from 0
 *  7. Donor pulse dots orbit the card header on a loop
 *  8. Trust strip slides up last
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Heart, Shield, ArrowRight, TrendingUp,
  Users, Clock, IndianRupee,
} from 'lucide-react'
import type { Campaign } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'

interface Props { campaigns: Campaign[] }

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function useCounter(target: number, duration = 1400, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active || target === 0) return
    let s: number | null = null
    const step = (ts: number) => {
      if (!s) s = ts
      const p = Math.min((ts - s) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return val
}

// ── ECG / heartbeat SVG line ──────────────────────────────────────────────────
// Draws a simplified ECG trace that animates in via stroke-dashoffset
function ECGLine({ active, color = '#1565D8' }: { active: boolean; color?: string }) {
  // ECG points across a 280×40 viewBox
  const points = '0,20 20,20 30,20 38,5 44,35 50,2 56,38 62,20 72,20 100,20 108,20 116,8 122,32 128,4 134,36 140,20 150,20 180,20 188,20 196,10 202,30 208,6 214,34 220,20 230,20 260,20 280,20'
  const pathLen = 420 // approximate total length

  return (
    <svg viewBox="0 0 280 40" className="w-full h-8" aria-hidden>
      {/* Baseline trace (faint) */}
      <polyline
        points={points}
        fill="none" stroke={color} strokeWidth="1" opacity="0.12"
      />
      {/* Animated foreground trace */}
      <polyline
        points={points}
        fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={pathLen}
        strokeDashoffset={active ? 0 : pathLen}
        style={{
          transition: active
            ? 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1) 0.3s'
            : 'none',
          filter: `drop-shadow(0 0 3px ${color}80)`,
        }}
      />
      {/* Travelling dot */}
      {active && (
        <circle r="3" fill={color} opacity="0.9"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          <animateMotion
            path={`M 0,20 L 20,20 L 30,20 L 38,5 L 44,35 L 50,2 L 56,38 L 62,20 L 72,20 L 100,20 L 108,20 L 116,8 L 122,32 L 128,4 L 134,36 L 140,20 L 150,20 L 180,20 L 188,20 L 196,10 L 202,30 L 208,6 L 214,34 L 220,20 L 230,20 L 260,20 L 280,20`}
            dur="2.8s"
            repeatCount="indefinite"
            begin="1.6s"
          />
        </circle>
      )}
    </svg>
  )
}

// ── Radial progress ring ──────────────────────────────────────────────────────
function RadialRing({ pct, active }: { pct: number; active: boolean }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const filled = circ * (pct / 100)
  const color = pct >= 75 ? '#18B55A' : pct >= 40 ? '#1565D8' : '#F59E0B'

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="24" cy="24" r={r} fill="none" stroke="#DCE3EC" strokeWidth="3.5" />
        {/* Fill */}
        <circle
          cx="24" cy="24" r={r}
          fill="none" stroke={color} strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={active ? circ - filled : circ}
          style={{
            transition: active
              ? 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) 0.6s'
              : 'none',
            filter: `drop-shadow(0 0 2px ${color}60)`,
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-extrabold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  )
}

// ── Animated raised counter ───────────────────────────────────────────────────
function RaisedCounter({ amount, active }: { amount: number; active: boolean }) {
  const val = useCounter(amount, 1400, active)
  return (
    <span className="text-green font-extrabold text-sm">
      ₹{val.toLocaleString('en-IN')}
    </span>
  )
}

// ── Campaign card ─────────────────────────────────────────────────────────────
function CampaignCard({
  campaign, delay, sectionVisible,
}: {
  campaign: Campaign
  delay: number
  sectionVisible: boolean
}) {
  const { ref, visible } = useVisible(0.15)
  const active = sectionVisible && visible

  const photo      = campaign.photos?.[0] ?? ''
  const firstName  = campaign.patientName?.split(' ')[0] ?? 'Patient'
  const raised     = campaign.amountRaised ?? 0
  const goal       = campaign.estimatedCost ?? 1
  const pct        = Math.min(Math.round((raised / goal) * 100), 100)
  const remaining  = Math.max(goal - raised, 0)
  const slug       = campaign.slug ?? campaign.id

  // Urgency: low funding = more urgent colour
  const urgency    = pct < 30 ? 'high' : pct < 60 ? 'mid' : 'low'
  const ecgColor   = urgency === 'high' ? '#EF4444' : urgency === 'mid' ? '#1565D8' : '#18B55A'

  return (
    <div
      ref={ref}
      style={{
        opacity:   sectionVisible ? 1 : 0,
        transform: sectionVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
      className="group relative flex flex-col bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-[0_12px_40px_rgba(21,101,216,0.14)] hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
    >
      {/* ── Top accent bar ── */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${ecgColor}, #18B8E6, #18B55A)` }}
      />

      {/* ── ECG Header strip ── */}
      <div
        className="relative px-5 pt-4 pb-2 overflow-hidden"
        style={{ background: `linear-gradient(to bottom, ${ecgColor}08, transparent)` }}
      >
        {/* Live indicator */}
        <div className="absolute top-3 right-4 flex items-center gap-1.5">
          {urgency === 'high' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: ecgColor }}
          >
            {urgency === 'high' ? 'Urgent' : urgency === 'mid' ? 'Active' : 'Funded'}
          </span>
        </div>

        <ECGLine active={active} color={ecgColor} />
      </div>

      {/* ── Patient photo ── */}
      <div className="relative h-40 overflow-hidden mx-4 rounded-2xl">
        {photo ? (
          <LazyImage
            src={photo}
            alt={`${firstName}'s campaign`}
            revealBlur revealScale
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${ecgColor}30, #18B8E640)` }}
          >
            <Heart size={36} fill={ecgColor} className="opacity-30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent rounded-2xl" />

        {/* Doctor verified badge */}
        {campaign.doctorVerified && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-green text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md">
            <Shield size={8} />
            Dr. Verified
          </div>
        )}

        {/* Patient name overlay */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <p className="text-white font-extrabold text-sm leading-tight drop-shadow">
            {firstName}&rsquo;s Story
          </p>
          <p className="text-white/75 text-[10px] font-medium">{campaign.diagnosis}</p>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-4">

        {/* Story excerpt */}
        {campaign.patientStory && (
          <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">
            {campaign.patientStory.replace(/<[^>]*>/g, '').slice(0, 130)}…
          </p>
        )}

        {/* ── Progress section ── */}
        <div className="flex items-center gap-3">
          {/* Radial ring */}
          <RadialRing pct={pct} active={active} />

          {/* Text + bar */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <RaisedCounter amount={raised} active={active} />
              <span className="text-text-secondary font-medium">
                of ₹{goal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Animated fill bar */}
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: active ? `${pct}%` : '0%',
                  background: `linear-gradient(90deg, ${ecgColor}, #18B8E6, #18B55A)`,
                  transition: active
                    ? 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.5s'
                    : 'none',
                  boxShadow: active ? `0 0 6px ${ecgColor}60` : 'none',
                }}
              />
            </div>

            {/* Remaining */}
            <p className="text-[10px] text-text-secondary">
              <span className="font-bold text-navy">
                ₹{remaining.toLocaleString('en-IN')}
              </span>{' '}still needed
            </p>
          </div>
        </div>

        {/* ── Meta row ── */}
        <div className="flex items-center gap-3 text-[10px] text-text-secondary">
          {campaign.hospital && (
            <span className="flex items-center gap-1 truncate">
              <IndianRupee size={9} className="text-primary shrink-0" />
              {campaign.hospital}
            </span>
          )}
          {campaign.updates?.length > 0 && (
            <span className="flex items-center gap-1 shrink-0 ml-auto">
              <Clock size={9} />
              {campaign.updates.length} update{campaign.updates.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── CTA buttons ── */}
        <div className="flex gap-2">
          <Link
            href={`/patient-assistance/${slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[12px] text-white transition-all shadow-[0_4px_14px_rgba(21,101,216,0.22)] hover:shadow-[0_6px_20px_rgba(21,101,216,0.35)] hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(90deg, ${ecgColor}, #18B8E6)`,
            }}
          >
            <Heart size={11} fill="white" />
            Donate Now
          </Link>
          <Link
            href={`/patient-assistance/${slug}`}
            className="px-3.5 py-2.5 rounded-xl font-bold text-[12px] border border-border text-text-secondary hover:border-primary hover:text-primary transition-all"
          >
            Story
          </Link>
        </div>
      </div>

      {/* ── Hover: donor activity pulse strip ── */}
      <div className="overflow-hidden h-0 group-hover:h-9 transition-all duration-300 border-t border-border/50">
        <div className="flex items-center gap-2 px-5 py-2 bg-bg">
          <div className="flex -space-x-1.5">
            {['#1565D8', '#18B55A', '#18B8E6', '#143B7D'].map((c, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-bold text-white"
                style={{ background: c }}
              >
                {['A', 'R', 'S', 'M'][i]}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text-secondary">
            <span className="font-bold text-navy">People</span> are donating to this campaign
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Trust badge ───────────────────────────────────────────────────────────────
function TrustBadge({ icon: Icon, label, note, delay, visible }: {
  icon: React.ElementType; label: string; note: string; delay: number; visible: boolean
}) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div className="w-9 h-9 rounded-xl bg-primary/6 border border-primary/12 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-primary" />
      </div>
      <div>
        <p className="text-[12px] font-extrabold text-navy">{label}</p>
        <p className="text-[11px] text-text-secondary">{note}</p>
      </div>
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function CampaignHighlight({ campaigns }: Props) {
  const { ref, visible } = useVisible(0.06)

  if (!campaigns.length) return null

  const shown = campaigns.slice(0, 3)

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div ref={ref} className="container-max px-4 md:px-8">

        {/* ── Header ── */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12"
          style={{
            opacity:   visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(-20px)',
            transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green/8 border border-green/20 text-green text-[11px] font-bold uppercase tracking-widest mb-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green" />
              </span>
              Live Campaigns
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight tracking-tight">
              Every Heartbeat<br />
              <span className="text-primary">Needs Your Support</span>
            </h2>
            <p className="text-text-secondary text-base mt-3 leading-relaxed max-w-lg">
              Real patients. Doctor-verified needs. 100% of your donation
              goes toward life-saving cardiac care — tracked transparently.
            </p>
          </div>

          {/* Right: live campaign count badge + CTA */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy/4 border border-navy/10">
              <Users size={13} className="text-navy" />
              <span className="text-[11px] font-bold text-navy">
                {shown.length} campaign{shown.length !== 1 ? 's' : ''} active now
              </span>
            </div>
            <Link
              href="/patient-assistance"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border-2 border-primary/25 text-primary hover:bg-primary hover:text-white transition-all"
            >
              See All Campaigns
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── Campaign cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((c, i) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              delay={180 + i * 130}
              sectionVisible={visible}
            />
          ))}
        </div>

        {/* ── Trust strip ── */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-12 pt-8 border-t border-border">
          <TrustBadge icon={Shield}     label="Doctor-Verified"  note="Every campaign is medically validated"  delay={600} visible={visible} />
          <TrustBadge icon={TrendingUp} label="100% Transparent" note="Track where every rupee goes"           delay={720} visible={visible} />
          <TrustBadge icon={IndianRupee} label="Secure Payments" note="Powered by Razorpay — PCI-DSS secure"  delay={840} visible={visible} />
        </div>

        {/* ── Bottom CTA — for users who want to donate without picking a campaign ── */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.5s ease 900ms, transform 0.5s ease 900ms',
          }}
        >
          <Link
            href="/donate"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-primary shadow-[0_8px_32px_rgba(21,101,216,0.22)] hover:shadow-[0_12px_40px_rgba(21,101,216,0.32)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <Heart size={17} fill="white" />
            Make a General Donation
          </Link>
          <Link
            href="/patient-assistance"
            className="text-text-secondary hover:text-primary text-sm font-medium transition-colors flex items-center gap-1"
          >
            Browse all patient campaigns →
          </Link>
        </div>
      </div>
    </section>
  )
}
