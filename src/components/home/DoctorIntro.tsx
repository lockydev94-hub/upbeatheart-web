'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Award, GraduationCap, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { SiteSettings } from '@/types/firestore'
import { cld } from '@/lib/cloudinary'

interface Props { settings: SiteSettings }

const QUALIFICATIONS = [
  { icon: GraduationCap, label: 'Medical Degree', note: 'MBBS — Distinguished Graduate' },
  { icon: Award,         label: 'Post-Graduate',  note: 'MD — Internal Medicine' },
  { icon: Award,         label: 'Cardiology DM',  note: 'DM (Cardiology) — Super-Specialist' },
]

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

export default function DoctorIntro({ settings }: Props) {
  const { ref, visible } = useScrollReveal(0.1)
  const quals = settings.doctorQuals?.split(',').map(q => q.trim()).filter(Boolean) ?? []

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-16 md:py-24 bg-white overflow-hidden"
    >
      <div className="container-max px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Doctor photo — slides in from left ── */}
          <div
            className="relative flex items-center justify-center lg:justify-start"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateX(-48px)',
              transition: 'opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {/* Background blob — rotates slowly */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div
                className="absolute top-8 left-8 w-72 h-72 rounded-full opacity-10 blur-3xl"
                style={{
                  background: 'var(--gradient-primary)',
                  animation: 'rotateSlow 18s linear infinite',
                }}
              />
            </div>

            {/* Photo frame */}
            <div className="relative w-[280px] md:w-[340px] lg:w-[380px]">
              {/* Animated dashed ring — rotates */}
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2.5rem] border-2 border-dashed border-primary/25"
                style={{ animation: 'rotateSlow 20s linear infinite' }}
              />

              {/* Glow ring that pulses */}
              <div
                aria-hidden
                className="absolute -inset-2 rounded-3xl opacity-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(21,101,216,0.15), rgba(24,184,230,0.1), rgba(24,181,90,0.12))',
                  animation: visible ? 'pulseGlow 3s ease-in-out infinite 0.8s' : 'none',
                  borderRadius: '1.75rem',
                }}
              />

              {/* Photo card */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-[0_16px_64px_rgba(21,101,216,0.18)] border border-border/40"
                style={{
                  animation: visible ? 'floatY 5s ease-in-out infinite 0.5s' : 'none',
                }}
              >
                {settings.doctorPhotoUrl ? (
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={cld.doctorAbout(settings.doctorPhotoUrl)}
                      alt={settings.doctorName ?? 'Doctor Photo'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 280px, 380px"
                    />
                    {/* Gradient bottom overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                    {/* Name plate */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-lg font-extrabold drop-shadow leading-tight">
                        {settings.doctorName}
                      </p>
                      <p className="text-white/70 text-xs font-medium">{settings.doctorTitle}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] gradient-primary flex items-center justify-center">
                    <span className="text-white/30 text-8xl font-extrabold">
                      {(settings.doctorName ?? 'D').replace(/^Dr\.?\s*/i, '').charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Hospital badge — floats */}
              {settings.hospitalName && (
                <div
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-border/60 px-4 py-3 flex items-center gap-2.5"
                  style={{
                    animation: visible ? 'floatBadge 4.5s ease-in-out infinite 1s' : 'none',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.6s ease 0.6s',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">Associated With</p>
                    <p className="text-xs font-extrabold text-navy leading-tight">{settings.hospitalName}</p>
                  </div>
                </div>
              )}

              {/* Years experience badge — pops in */}
              {settings.doctorExperience && (
                <div
                  className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-white shadow-[0_4px_20px_rgba(21,101,216,0.18)] border border-border/60 flex flex-col items-center justify-center"
                  style={{
                    animation: visible ? 'popIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.4s both, floatBadge 5s ease-in-out infinite 1.4s' : 'none',
                    opacity: visible ? 1 : 0,
                  }}
                >
                  <p className="text-xl font-extrabold text-primary leading-none">{settings.doctorExperience.replace(/\D/g,'')}</p>
                  <p className="text-[9px] font-bold text-text-secondary text-center leading-tight mt-0.5">Yrs<br/>Exp.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Bio + qualifications + CTA — slides in from right ── */}
          <div
            className="space-y-6"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateX(48px)',
              transition: 'opacity 0.75s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.75s cubic-bezier(0.22,1,0.36,1) 0.1s',
            }}
          >
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest"
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'none' : 'translateY(-12px)',
                transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Meet Your Cardiologist
            </div>

            {/* Heading with shimmer on name */}
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight tracking-tight">
                {settings.doctorName
                  ? <><span className="shimmer-text">{settings.doctorName}</span></>
                  : 'Expert Cardiac Care'}
              </h2>
              <p className="text-primary font-semibold text-base mt-1">
                {settings.doctorTitle ?? 'Consultant Cardiologist'}
              </p>
            </div>

            {/* Bio */}
            {settings.doctorBio && (
              <p
                className="text-text-secondary text-base leading-relaxed"
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? 'none' : 'translateY(16px)',
                  transition: 'opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s',
                }}
              >
                {settings.doctorBio}
              </p>
            )}

            {/* Qualifications pills — staggered pop-in */}
            {quals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quals.map((q, i) => (
                  <span
                    key={q}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-bg border border-border text-navy hover:border-primary/30 hover:bg-primary/4 transition-all duration-200"
                    style={{
                      opacity:    visible ? 1 : 0,
                      transform:  visible ? 'none' : 'scale(0.8)',
                      transition: `opacity 0.45s ease ${0.4 + i * 0.07}s, transform 0.45s cubic-bezier(0.22,1,0.36,1) ${0.4 + i * 0.07}s`,
                    }}
                  >
                    <CheckCircle2 size={11} className="text-green shrink-0" />
                    {q}
                  </span>
                ))}
              </div>
            )}

            {/* Achievement cards — staggered slide-up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUALIFICATIONS.map(({ icon: Icon, label, note }, i) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-bg border border-border hover:border-primary/30 hover:shadow-[0_4px_18px_rgba(21,101,216,0.10)] hover:-translate-y-0.5 transition-all duration-250 group"
                  style={{
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'none' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${0.45 + i * 0.1}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.45 + i * 0.1}s, box-shadow 0.2s ease, border-color 0.2s ease`,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-primary/12 transition-transform duration-200">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-navy leading-tight">{label}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5 leading-snug">{note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA — fade up last */}
            <div
              className="flex flex-col sm:flex-row gap-3 pt-2"
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'none' : 'translateY(20px)',
                transition: 'opacity 0.5s ease 0.7s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.7s',
              }}
            >
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white gradient-primary shadow-[0_4px_20px_rgba(21,101,216,0.25)] hover:shadow-[0_6px_28px_rgba(21,101,216,0.38)] hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200"
              >
                View Full Profile
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-primary/25 text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-200"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes rotateSlow   { to { transform: rotate(360deg); } }
        @keyframes floatY       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatBadge   { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
        @keyframes pulseGlow    { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes popIn        { 0%{opacity:0;transform:scale(0.7)} 70%{transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
      `}</style>
    </section>
  )
}
