'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Check, MapPin, Phone, ShieldCheck } from 'lucide-react'

import type { SiteSettings } from '@/types/firestore'
import { cloudinaryPortrait } from '@/lib/cloudinary'
import LazyImage from '@/components/ui/LazyImage'

import usePrefersReducedMotion from './usePrefersReducedMotion'
import { buildDoctorStats, TRUST_SIGNALS } from './heroData'

/**
 * DoctorPanel — the hero's left column.
 *
 * Identity first: portrait inside a rotating gradient halo, then name and
 * credentials, then the four credibility stats that count up on load, then
 * the two ways to get in touch. Entrance is a single staggered cascade so the
 * eye lands on the doctor before anything else moves.
 */
export default function DoctorPanel({ settings }: { settings: SiteSettings }) {
  const stats      = buildDoctorStats(settings.doctorExperience)
  const waClean    = settings.whatsapp?.replace(/\D/g, '') ?? ''
  const phoneClean = settings.phone?.replace(/\D/g, '') ?? ''
  const initial    = (settings.doctorName ?? 'D').replace(/^Dr\.?\s*/i, '').charAt(0)

  return (
    <div className="relative">

      {/* ── Availability badge ── */}
      <div className="anim-fade-left delay-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green/25 bg-green/5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-green">
        <span className="relative flex w-2 h-2">
          <span className="hero-live-ping absolute inset-0 rounded-full bg-green" />
          <span className="relative w-2 h-2 rounded-full bg-green" />
        </span>
        Accepting Appointments
      </div>

      {/* ══ Doctor card ══ */}
      <div className="relative mt-4 anim-grow-in delay-75">
        <div className="hero-ring absolute -inset-[2px] rounded-[28px] pointer-events-none z-0" aria-hidden />

        <div className="relative z-10 rounded-[26px] border border-border/40 bg-white shadow-[0_10px_50px_rgba(21,101,216,0.14)] overflow-hidden p-5 lg:p-6">
          <div className="absolute top-0 left-0 right-0 h-[3px] gradient-primary" aria-hidden />

          <div className="flex gap-4 sm:gap-5 items-start">

            {/* ── Portrait with rotating halo ── */}
            <div className="relative shrink-0 anim-pop-in delay-150">
              {/* Conic halo rotating behind the frame */}
              <div
                className="hero-portrait-halo absolute -inset-2 rounded-[22px] blur-[10px] opacity-70"
                aria-hidden
              />
              <div className="relative w-28 h-36 lg:w-32 lg:h-[168px] rounded-2xl overflow-hidden border-2 border-white shadow-[0_0_0_2px_#1565D8,0_10px_34px_rgba(21,101,216,0.32)] z-10">
                {settings.doctorPhotoUrl ? (
                  <LazyImage
                    src={cloudinaryPortrait(settings.doctorPhotoUrl, 256, 341, 0.65)}
                    alt={settings.doctorName ?? 'Doctor'}
                    revealBlur
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <span className="text-white text-3xl font-extrabold">{initial}</span>
                  </div>
                )}
                {/* Slow light sweep across the portrait */}
                <span className="hero-portrait-sheen absolute inset-0 z-20 pointer-events-none" aria-hidden />
              </div>

              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green border-2 border-white shadow-sm z-20" aria-hidden />
            </div>

            {/* ── Name + credentials ── */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="anim-fade-up delay-200 text-xl lg:text-2xl xl:text-[28px] font-extrabold text-navy tracking-tight leading-tight">
                {settings.doctorName ?? 'Dr. Name'}
              </h1>

              <p className="anim-fade-up delay-250 text-primary font-bold text-xs lg:text-sm mt-1">
                {settings.doctorTitle ?? 'Consultant Paediatric Cardiologist'}
              </p>

              {settings.doctorQuals && (
                <p className="anim-fade-up delay-300 inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-navy/70 bg-bg border border-border/70 rounded-lg px-2 py-1 leading-snug">
                  <ShieldCheck size={11} className="text-primary shrink-0" />
                  {settings.doctorQuals}
                </p>
              )}

              {settings.hospitalName && (
                <div className="anim-fade-up delay-400 flex items-center gap-1 mt-2">
                  <MapPin size={10} className="text-primary/60 shrink-0" />
                  <span className="text-[11px] text-text-secondary/70 font-medium">{settings.hospitalName}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="anim-fade-up group relative text-center py-2.5 px-1.5 rounded-xl bg-gradient-to-b from-bg to-white border border-border/80 overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5"
                style={{ animationDelay: `${360 + i * 90}ms` }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
                <Icon size={14} className="mx-auto mb-1 text-primary/50 group-hover:text-primary transition-colors" />
                <p className="text-sm lg:text-base font-extrabold text-navy leading-none tabular-nums">
                  <CountUp value={value} delay={360 + i * 90} />
                </p>
                <p className="text-[9px] lg:text-[10px] text-text-secondary mt-1 leading-tight font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Hospital address ── */}
          {settings.hospitalAddress && (
            <div className="anim-fade-up delay-700 flex items-start gap-2 mt-3 p-3 rounded-xl bg-bg border border-border/60">
              <MapPin size={12} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-navy">{settings.hospitalName}</p>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-snug">{settings.hospitalAddress}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bio ── */}
      {settings.doctorBio && (
        <p className="anim-fade-up delay-500 mt-4 text-text-secondary text-sm leading-relaxed max-w-lg line-clamp-3">
          {settings.doctorBio}
        </p>
      )}

      {/* ── CTAs ── */}
      <div className="anim-fade-up delay-600 mt-4 flex flex-col sm:flex-row gap-2.5">
        <Link
          href="/appointment"
          className="hero-cta group relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm gradient-primary shadow-[0_4px_20px_rgba(21,101,216,0.30)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(21,101,216,0.45)] active:scale-[0.98]"
        >
          <Calendar size={15} />
          Book Appointment
        </Link>

        {waClean ? (
          <a
            href={`https://wa.me/${waClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 border-[#25D366]/40 text-[#128C7E] bg-[#25D366]/5 transition-all hover:bg-[#25D366] hover:text-white hover:border-[#25D366] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden>
              <path d="M12.031 0C5.384 0 .001 5.383.001 12.029c0 2.122.558 4.197 1.617 6.023L0 24l6.195-1.594A12.01 12.01 0 0012.03 24h.002C18.676 24 24.06 18.617 24.06 11.97 24.059 5.383 18.676 0 12.031 0zm5.453 16.56c-.298-.15-1.763-.87-2.036-.968-.273-.1-.472-.149-.671.15-.198.298-.768.968-.942 1.167-.174.199-.348.224-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.765-1.658-2.063-.173-.298-.018-.459.13-.607.134-.134.298-.349.447-.523.149-.174.199-.298.299-.497.1-.199.05-.373-.025-.522-.075-.15-.671-1.617-.919-2.214-.242-.581-.488-.502-.671-.511-.173-.008-.372-.01-.571-.01-.199 0-.522.074-.795.373-.273.298-1.044 1.02-1.044 2.488 0 1.468 1.069 2.886 1.218 3.085.15.199 2.104 3.21 5.096 4.502.712.307 1.268.491 1.701.629.715.227 1.366.195 1.88.118.573-.086 1.763-.72 2.012-1.416.249-.696.249-1.292.174-1.416-.075-.124-.273-.199-.572-.348z" />
            </svg>
            Chat on WhatsApp
          </a>
        ) : settings.phone ? (
          <a
            href={`tel:${phoneClean}`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 border-border text-text-secondary transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
          >
            <Phone size={15} />
            {settings.phone}
          </a>
        ) : null}
      </div>

      {/* ── Trust signals ── */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {TRUST_SIGNALS.map((t, i) => (
          <span
            key={t}
            className="anim-fade-up flex items-center gap-1 text-[11px] text-text-secondary font-medium"
            style={{ animationDelay: `${700 + i * 90}ms` }}
          >
            <Check size={11} className="text-green shrink-0" />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   CountUp — animates the numeric prefix of a stat from 0 to its value.

   Stat values are short display strings rather than plain numbers ("15+",
   "10K+", "4.9★", "0–40"), so we split off the leading number, animate that,
   and re-attach the rest. Anything without a leading number — or any visitor
   who prefers reduced motion — just gets the final string.

   The initial state is the final value so the server render and the first
   client render agree; the animation starts from the effect.
───────────────────────────────────────────────────────────────────────────── */
function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/)
    if (reduced || !m) {
      setDisplay(value)
      return
    }

    const target   = parseFloat(m[1])
    const decimals = (m[1].split('.')[1] ?? '').length
    const suffix   = m[2]

    // "0–40" and friends have nothing to count towards — leave them alone.
    if (target === 0) {
      setDisplay(value)
      return
    }

    let raf = 0
    let startedAt = 0
    const DURATION = 1100

    const tick = (now: number) => {
      if (!startedAt) startedAt = now
      const t = Math.min(1, (now - startedAt) / DURATION)
      const eased = 1 - Math.pow(1 - t, 3)

      if (t < 1) {
        setDisplay((target * eased).toFixed(decimals) + suffix)
        raf = requestAnimationFrame(tick)
      } else {
        setDisplay(value)
      }
    }

    const timer = setTimeout(() => { raf = requestAnimationFrame(tick) }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [value, delay, reduced])

  return <>{display}</>
}
