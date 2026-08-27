'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Check, MapPin, Phone, ShieldCheck } from 'lucide-react'

import type { SiteSettings } from '@/types/firestore'
import { cloudinaryPortrait } from '@/lib/cloudinary'

import usePrefersReducedMotion from './usePrefersReducedMotion'
import { buildDoctorStats, TRUST_SIGNALS } from './heroData'

/**
 * DoctorPanel — the hero's left column, a frosted-glass card floating on the
 * light hero field.
 *
 * Identity first: portrait with a static soft glow, then name with an
 * animated gradient shimmer, credentials, the four credibility stats that
 * count up on load, then the two ways to get in touch. Entrance is a single
 * staggered cascade so the eye lands on the doctor before anything else moves.
 * No ambient spinning/sheen animation around the portrait.
 */
export default function DoctorPanel({ settings }: { settings: SiteSettings }) {
  const stats      = buildDoctorStats(settings.doctorExperience)
  const waClean    = settings.whatsapp?.replace(/\D/g, '') ?? ''
  const phoneClean = settings.phone?.replace(/\D/g, '') ?? ''
  const initial    = (settings.doctorName ?? 'D').replace(/^Dr\.?\s*/i, '').charAt(0)

  return (
    <div className="relative">

      {/* ── Availability badge ── */}
      <div className="anim-fade-left delay-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#18B55A]/40 bg-[#18B55A]/10 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0E9F5C] backdrop-blur-sm">
        <span className="relative flex w-2 h-2">
          <span className="hero-live-ping absolute inset-0 rounded-full bg-[#18B55A]" />
          <span className="relative w-2 h-2 rounded-full bg-[#18B55A]" />
        </span>
        Accepting Appointments
      </div>

      {/* ══ Doctor glass card ══ */}
      <div className="relative mt-5 anim-grow-in delay-75">
        {/* Static gradient edge */}
        <div className="hero-ring absolute -inset-[1.5px] rounded-[28px] pointer-events-none z-0" aria-hidden />

        <div className="relative z-10 rounded-[26px] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_24px_70px_rgba(20,59,125,0.14),0_4px_18px_rgba(20,59,125,0.06)] overflow-hidden p-5 lg:p-6">
          {/* Inner top-light so the glass reads as a surface */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" aria-hidden />
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)]" aria-hidden />

          <div className="flex gap-4 sm:gap-5 items-start">

            {/* ── Portrait with static glow ── */}
            <div className="relative shrink-0 anim-pop-in delay-150">
              <div
                className="hero-portrait-halo absolute -inset-2 rounded-[22px] blur-[14px]"
                aria-hidden
              />
              <div className="relative w-28 h-36 lg:w-32 lg:h-[168px] rounded-2xl overflow-hidden border border-white shadow-[0_0_0_1px_rgba(21,101,216,0.18),0_14px_34px_rgba(20,59,125,0.25)] z-10">
                {settings.doctorPhotoUrl ? (
                  <img
                    src={cloudinaryPortrait(settings.doctorPhotoUrl, 256, 341, 0.65)}
                    alt={settings.doctorName ?? 'Doctor'}
                    className="object-cover object-top w-full h-full"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-[linear-gradient(135deg,#1565D8,#18B8E6)] flex items-center justify-center">
                    <span className="text-white text-3xl font-extrabold">{initial}</span>
                  </div>
                )}
              </div>

              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#18B55A] border-2 border-white shadow-[0_0_10px_rgba(24,181,90,0.6)] z-20" aria-hidden />
            </div>

            {/* ── Name + credentials ── */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="anim-fade-up delay-200 text-[22px] lg:text-2xl xl:text-[30px] font-extrabold tracking-tight leading-tight hero-title-grad">
                {settings.doctorName ?? 'Dr. Name'}
              </h1>

              <p className="anim-fade-up delay-250 text-primary font-bold text-xs lg:text-sm mt-1">
                {settings.doctorTitle ?? 'Consultant Paediatric Cardiologist'}
              </p>

              {settings.doctorQuals && (
                <p className="anim-fade-up delay-300 inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-navy/80 bg-white/70 border border-border rounded-lg px-2 py-1 leading-snug backdrop-blur-sm">
                  <ShieldCheck size={11} className="text-primary shrink-0" />
                  {settings.doctorQuals}
                </p>
              )}

              {settings.hospitalName && (
                <div className="anim-fade-up delay-400 flex items-center gap-1 mt-2">
                  <MapPin size={10} className="text-primary/60 shrink-0" />
                  <span className="text-[11px] text-text-secondary font-medium">{settings.hospitalName}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="anim-fade-up group relative text-center py-2.5 px-1.5 rounded-xl bg-white/70 border border-white/80 overflow-hidden transition-all duration-200 hover:border-primary/40 hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(21,101,216,0.12)]"
                style={{ animationDelay: `${360 + i * 90}ms` }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
                <Icon size={14} className="mx-auto mb-1 text-primary/70 group-hover:text-primary transition-colors" />
                <p className="text-sm lg:text-base font-extrabold text-navy leading-none tabular-nums">
                  <CountUp value={value} delay={360 + i * 90} />
                </p>
                <p className="text-[9px] lg:text-[10px] text-text-secondary mt-1 leading-tight font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Hospital address ── */}
          {settings.hospitalAddress && (
            <div className="anim-fade-up delay-700 flex items-start gap-2 mt-3 p-3 rounded-xl bg-white/60 border border-white/80">
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
          className="hero-cta group relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm bg-[linear-gradient(90deg,#1565D8,#18B8E6)] shadow-[0_8px_26px_rgba(21,101,216,0.32)] overflow-hidden transition-all hover:shadow-[0_12px_38px_rgba(21,101,216,0.42)] active:scale-[0.98]"
        >
          <Calendar size={15} />
          Book Appointment
        </Link>

        {waClean ? (
          <a
            href={`https://wa.me/${waClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border border-[#18B55A]/45 text-[#0E9F5C] bg-white/70 backdrop-blur-sm transition-all hover:bg-[#18B55A] hover:text-white hover:border-[#18B55A] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden>
              <path d="M12.031 0C5.384 0 .001 5.383.001 12.029c0 2.122.558 4.197 1.617 6.023L0 24l6.195-1.594A12.01 12.01 0 0012.03 24h.002C18.676 24 24.06 18.617 24.06 11.97 24.059 5.383 18.676 0 12.031 0zm5.453 16.56c-.298-.15-1.763-.87-2.036-.968-.273-.1-.472-.149-.671.15-.198.298-.768.968-.942 1.167-.174.199-.348.224-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.765-1.658-2.063-.173-.298-.018-.459.13-.607.134-.134.298-.349.447-.523.149-.174.199-.298.299-.497.1-.199.05-.373-.025-.522-.075-.15-.671-1.617-.919-2.214-.242-.581-.488-.502-.671-.511-.173-.008-.372-.01-.571-.01-.199 0-.522.074-.795.373-.273.298-1.044 1.02-1.044 2.488 0 1.468 1.069 2.886 1.218 3.085.15.199 2.104 3.21 5.096 4.502.712.307 1.268.491 1.701.629.715.227 1.366.195 1.88.118.573-.086 1.763-.72 2.012-1.416.249-.696.249-1.292.174-1.416-.074-.124-.273-.199-.572-.348z" />
            </svg>
            Chat on WhatsApp
          </a>
        ) : settings.phone ? (
          <a
            href={`tel:${phoneClean}`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border border-border text-navy bg-white/70 backdrop-blur-sm transition-all hover:border-primary/50 hover:text-primary active:scale-[0.98]"
          >
            <Phone size={15} />
            {settings.phone}
          </a>
        ) : null}
      </div>

      {/* ── Trust signals ── */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {TRUST_SIGNALS.map((t, i) => (
          <span
            key={t}
            className="anim-fade-up flex items-center gap-1 text-[11px] text-text-secondary font-medium"
            style={{ animationDelay: `${700 + i * 90}ms` }}
          >
            <Check size={11} className="text-[#18B55A] shrink-0" />
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