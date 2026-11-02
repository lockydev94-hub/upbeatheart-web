'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Award, GraduationCap, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { SiteSettings } from '@/types/firestore'
import { cld } from '@/lib/cloudinary'
import useScrollReveal from '@/hooks/useScrollReveal'
import Reveal from '@/components/ui/Reveal'

interface Props { settings: SiteSettings }

const QUALIFICATIONS = [
  { icon: GraduationCap, label: 'Medical Degree', note: 'MBBS — Distinguished Graduate' },
  { icon: Award,         label: 'Post-Graduate',  note: 'MD — Internal Medicine' },
  { icon: Award,         label: 'Cardiology DM',  note: 'DM (Cardiology) — Super-Specialist' },
]

export default function DoctorIntro({ settings }: Props) {
  // Signature effect: the portrait tips upright out of a 3D fold while the bio
  // slides in beside it. Replays on every pass, both directions.
  const { ref, visible, direction } = useScrollReveal<HTMLElement>({ offset: 0.1 })
  const quals = settings.doctorQuals?.split(',').map(q => q.trim()).filter(Boolean) ?? []

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 bg-white overflow-hidden"
    >
      <div className="container-max px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Doctor photo — tips upright out of a fold ── */}
          <Reveal
            effect="flip-x"
            visible={visible}
            direction={direction}
            className="relative flex items-center justify-center lg:justify-start"
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
          </Reveal>

          {/* ── Right: Bio + qualifications + CTA — slides in from right ── */}
          <Reveal
            effect="slide-right"
            delay={120}
            visible={visible}
            direction={direction}
            className="space-y-6"
          >
            {/* Eyebrow */}
            <Reveal
              effect="fade-down"
              delay={220}
              visible={visible}
              direction={direction}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Meet Your Cardiologist
            </Reveal>

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
              <Reveal
                as="p"
                effect="fade-up"
                delay={350}
                visible={visible}
                direction={direction}
                className="text-text-secondary text-base leading-relaxed"
              >
                {settings.doctorBio}
              </Reveal>
            )}

            {/* Qualifications pills — staggered pop-in */}
            {quals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quals.map((q, i) => (
                  <Reveal
                    key={q}
                    as="span"
                    effect="pop-center"
                    delay={400 + i * 70}
                    visible={visible}
                    direction={direction}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-bg border border-border text-navy hover:border-primary/30 hover:bg-primary/4 transition-all duration-200"
                  >
                    <CheckCircle2 size={11} className="text-green shrink-0" />
                    {q}
                  </Reveal>
                ))}
              </div>
            )}

            {/* Achievement cards — staggered slide-up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUALIFICATIONS.map(({ icon: Icon, label, note }, i) => (
                <Reveal
                  key={label}
                  effect="fade-up"
                  delay={450 + i * 100}
                  visible={visible}
                  direction={direction}
                >
                  <div className="flex items-start gap-3 h-full p-3.5 rounded-xl bg-bg border border-border hover:border-primary/30 hover:shadow-[0_4px_18px_rgba(21,101,216,0.10)] hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-primary/12 transition-transform duration-200">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-navy leading-tight">{label}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 leading-snug">{note}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* CTA — fade up last */}
            <Reveal
              effect="fade-up"
              delay={700}
              visible={visible}
              direction={direction}
              className="flex flex-col sm:flex-row gap-3 pt-2"
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
            </Reveal>
          </Reveal>
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
