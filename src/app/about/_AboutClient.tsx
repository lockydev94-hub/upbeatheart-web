'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  GraduationCap, Award, Building2, Heart,
  Calendar, CheckCircle2, ArrowRight,
  Stethoscope, Users, Activity, Shield,
  BookOpen, Microscope, Globe, Phone, Star,
} from 'lucide-react'
import { cloudinaryPortrait } from '@/lib/cloudinary'
import type { SiteSettings } from '@/types/firestore'

/* ─── Scroll-reveal hook ────────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/* ─── Animated counter ─────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', active }: { target: number; suffix?: string; active: boolean }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    const dur = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target])
  return <>{val.toLocaleString('en-IN')}{suffix}</>
}

/* ─── Static data ──────────────────────────────────────────────────── */
const ACHIEVEMENTS = [
  { icon: Users,    value: 10000, suffix: '+', label: 'Patients Treated',     color: 'from-blue-500 to-primary' },
  { icon: Calendar, value: 15,   suffix: '+', label: 'Years Experience',      color: 'from-cyan-500 to-cyan' },
  { icon: Award,    value: 20,   suffix: '+', label: 'Awards & Recognitions', color: 'from-amber-500 to-yellow-400' },
  { icon: BookOpen, value: 30,   suffix: '+', label: 'Research Publications', color: 'from-green-500 to-green' },
]

const QUALIFICATIONS = [
  { degree: 'MBBS',              institution: 'Osmania Medical College, Hyderabad',          year: '2003', icon: GraduationCap, color: 'from-primary to-cyan' },
  { degree: 'MD — Internal Medicine', institution: "Nizam's Institute of Medical Sciences", year: '2007', icon: BookOpen,      color: 'from-cyan to-green' },
  { degree: 'DM — Cardiology',   institution: 'Sri Venkateswara Institute of Medical Sciences', year: '2010', icon: Stethoscope,  color: 'from-green to-primary' },
]

const EXPERTISE = [
  { icon: Activity,   title: 'Interventional Cardiology', desc: 'Angioplasty, stenting, cardiac catheterisation and complex PCI procedures.' },
  { icon: Heart,      title: 'Heart Failure Management',  desc: 'Advanced management of acute and chronic heart failure with latest protocols.' },
  { icon: Microscope, title: 'Electrophysiology',         desc: 'Arrhythmia diagnosis, ablation therapy, and device implantation.' },
  { icon: Shield,     title: 'Preventive Cardiology',     desc: 'Risk stratification, lifestyle counselling and preventive programmes.' },
  { icon: Globe,      title: 'Community Outreach',        desc: 'Free cardiac screening camps and NGO partnerships for underserved communities.' },
  { icon: Users,      title: 'Patient Assistance',        desc: 'Connecting financially weak cardiac patients with donors and NGO support.' },
]

const MEMBERSHIPS = [
  'Cardiological Society of India (CSI)',
  'Indian Medical Association (IMA)',
  'European Society of Cardiology (ESC)',
  'American College of Cardiology (ACC)',
  'Heart Failure Society of India (HFSI)',
]

const AWARDS = [
  { year: '2023', title: 'Best Cardiologist — Telangana State Medical Awards' },
  { year: '2022', title: 'Excellence in Patient Care — CARE Hospitals' },
  { year: '2021', title: 'Community Healthcare Champion — Health Ministry' },
  { year: '2019', title: 'Outstanding Physician Award — IMA' },
  { year: '2017', title: 'Young Cardiologist Award — CSI Annual Conference' },
]

/* ════════════════════════════════════════════════
   HERO SECTION
════════════════════════════════════════════════ */
function HeroSection({ s }: { s: SiteSettings }) {
  const quals = s.doctorQuals?.split(',').map(q => q.trim()).filter(Boolean) ?? []
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  return (
    <section
      className="relative overflow-hidden py-20 md:py-32"
      style={{ background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B55A 100%)' }}
    >
      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" style={{ animation: 'floatY 8s ease-in-out infinite' }} />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" style={{ animation: 'floatY 10s ease-in-out infinite 2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-cyan/5 blur-3xl" style={{ animation: 'floatY 7s ease-in-out infinite 1s' }} />

        {/* Animated ECG line */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 60" fill="none" preserveAspectRatio="none" aria-hidden>
          <polyline
            className="ecg-path"
            points="0,30 200,30 220,5 240,55 260,30 280,30 300,30 320,10 340,50 360,30 560,30 580,5 600,55 620,30 820,30 840,10 860,50 880,30 1200,30"
            stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none"
          />
        </svg>

        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <defs>
            <pattern id="aboutDots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aboutDots)" />
        </svg>
      </div>

      <div className="container-max px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text — slides from left */}
          <div
            className="text-white space-y-6"
            style={{
              opacity:    mounted ? 1 : 0,
              transform:  mounted ? 'none' : 'translateX(-48px)',
              transition: 'opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest"
              style={{ animation: mounted ? 'fadeDown 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both' : 'none' }}
            >
              <Heart size={11} className="fill-white text-white anim-heartbeat" />
              About the Doctor
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ animation: mounted ? 'fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both' : 'none' }}
            >
              {s.doctorName
                ? <span className="shimmer-text">{s.doctorName}</span>
                : 'Expert Cardiologist'}
            </h1>

            <p
              className="text-white/80 text-lg font-medium"
              style={{ animation: mounted ? 'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.25s both' : 'none' }}
            >
              {s.doctorTitle || 'Consultant Cardiologist'}
              {s.hospitalName ? ` · ${s.hospitalName}` : ''}
            </p>

            {s.doctorBio && (
              <p
                className="text-white/70 text-base leading-relaxed max-w-xl"
                style={{ animation: mounted ? 'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.32s both' : 'none' }}
              >
                {s.doctorBio}
              </p>
            )}

            {/* Qual pills — stagger */}
            {quals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quals.map((q, i) => (
                  <span
                    key={q}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-colors"
                    style={{ animation: mounted ? `popIn 0.45s cubic-bezier(0.22,1,0.36,1) ${0.38 + i * 0.07}s both` : 'none' }}
                  >
                    <CheckCircle2 size={11} className="text-green-300 shrink-0" />
                    {q}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-3 pt-2"
              style={{ animation: mounted ? 'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.55s both' : 'none' }}
            >
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-primary hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              >
                Book Appointment <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
              >
                <Phone size={15} /> Contact Clinic
              </Link>
            </div>
          </div>

          {/* Right: Photo — slides from right */}
          <div
            className="flex justify-center lg:justify-end"
            style={{
              opacity:    mounted ? 1 : 0,
              transform:  mounted ? 'none' : 'translateX(48px)',
              transition: 'opacity 0.75s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.75s cubic-bezier(0.22,1,0.36,1) 0.1s',
            }}
          >
            <div className="relative w-[260px] md:w-[320px]">
              {/* Rotating dashed ring */}
              <div
                className="absolute -inset-5 rounded-[2.5rem] border-2 border-dashed border-white/20"
                aria-hidden
                style={{ animation: 'rotateSlow 20s linear infinite' }}
              />

              {/* Glow behind photo */}
              <div
                className="absolute -inset-3 rounded-3xl blur-2xl opacity-30"
                style={{ background: 'linear-gradient(135deg,#1565D8,#18B8E6,#18B55A)', animation: 'pulseGlowHero 3s ease-in-out infinite' }}
                aria-hidden
              />

              {/* Photo card — floats */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/20"
                style={{ animation: 'floatY 5s ease-in-out infinite 0.5s' }}
              >
                {s.doctorPhotoUrl ? (
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={cloudinaryPortrait(s.doctorPhotoUrl, 500, 667, 0.72)}
                      alt={s.doctorName || 'Doctor'}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 260px, 320px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#143B7D]/60 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center bg-white/10">
                    <Heart size={80} className="text-white/20 anim-heartbeat" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Experience badge — floats offset */}
              {s.doctorExperience && (
                <div
                  className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-white shadow-xl border border-border/40 flex flex-col items-center justify-center"
                  style={{ animation: 'floatBadge 4.5s ease-in-out infinite 1.2s, popIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.6s both' }}
                >
                  <p className="text-2xl font-extrabold text-primary leading-none">
                    {s.doctorExperience.replace(/\D/g, '')}
                  </p>
                  <p className="text-[9px] font-bold text-text-secondary text-center leading-tight mt-0.5">Years<br/>of Care</p>
                </div>
              )}

              {/* Hospital badge */}
              {s.hospitalName && (
                <div
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-border/40 px-3 py-2.5 flex items-center gap-2"
                  style={{ animation: 'floatBadge 5s ease-in-out infinite 0.8s, popIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.45s both' }}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Associated</p>
                    <p className="text-[11px] font-extrabold text-navy leading-tight">{s.hospitalName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeDown     { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes popIn        { 0%{opacity:0;transform:scale(0.7)} 70%{transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
        @keyframes floatY       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatBadge   { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
        @keyframes rotateSlow   { to{transform:rotate(360deg)} }
        @keyframes pulseGlowHero{ 0%,100%{opacity:0.25} 50%{opacity:0.45} }
        @keyframes heartbeat    { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} 56%{transform:scale(1)} }
        .anim-heartbeat { animation: heartbeat 2.2s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg,#fff 0%,#a5f3fc 35%,#86efac 55%,#a5f3fc 75%,#fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmerSweep 3.5s linear infinite;
        }
        @keyframes shimmerSweep { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>
    </section>
  )
}

/* ════════════════════════════════════════════════
   ACHIEVEMENTS STRIP — animated counters
════════════════════════════════════════════════ */
function AchievementsStrip() {
  const { ref, visible } = useReveal(0.15)

  return (
    <section className="bg-navy py-10 overflow-hidden" ref={ref}>
      <div className="container-max px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ACHIEVEMENTS.map(({ icon: Icon, value, suffix, label, color }, i) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-2 group"
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'none' : 'translateY(24px)',
                transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
              }}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-200 shadow-lg`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <p className="text-3xl font-extrabold text-white leading-none tabular-nums">
                <AnimatedCounter target={value} suffix={suffix} active={visible} />
              </p>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">{label}</p>
              {/* Bottom accent line */}
              <div className={`h-0.5 w-8 rounded-full bg-gradient-to-r ${color} opacity-60 group-hover:w-12 transition-all duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════
   QUALIFICATIONS TIMELINE
════════════════════════════════════════════════ */
function QualificationsSection() {
  const { ref, visible } = useReveal(0.08)

  return (
    <section className="py-16 md:py-24 bg-bg overflow-hidden" ref={ref}>
      <div className="container-max px-4 md:px-8">

        {/* Header */}
        <div
          className="text-center mb-14"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'none' : 'translateY(-24px)',
            transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <GraduationCap size={11} />
            Academic Journey
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight">
            Qualifications &amp;{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)' }}>
              Education
            </span>
          </h2>
          <p className="text-text-secondary mt-3 max-w-lg mx-auto">
            A rigorous academic foundation built over a decade of medical training at premier institutions.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto">
          {/* Animated vertical line */}
          <div
            className="absolute left-8 top-0 bottom-0 w-0.5"
            style={{
              background: 'linear-gradient(to bottom, #1565D8, #18B8E6, #18B55A)',
              opacity: visible ? 0.4 : 0,
              transition: 'opacity 0.8s ease 0.3s',
            }}
            aria-hidden
          />

          <div className="space-y-8">
            {QUALIFICATIONS.map(({ degree, institution, year, icon: Icon, color }, i) => (
              <div
                key={degree}
                className="relative flex gap-6 items-start pl-20"
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? 'none' : 'translateX(-32px)',
                  transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.15}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.15}s`,
                }}
              >
                {/* Node */}
                <div
                  className={`absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(21,101,216,0.25)] bg-gradient-to-br ${color} group-hover:scale-105 transition-transform`}
                  style={{ animation: visible ? `floatY ${4.5 + i * 0.8}s ease-in-out infinite ${i * 0.4}s` : 'none' }}
                >
                  <Icon size={24} className="text-white" />
                </div>

                {/* Card */}
                <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-[0_8px_32px_rgba(21,101,216,0.12)] hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group">
                  {/* Top gradient strip on hover */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-extrabold text-navy text-base leading-tight">{degree}</p>
                      <p className="text-text-secondary text-sm mt-0.5">{institution}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">
                      {year}
                    </span>
                  </div>
                  {/* Progress dot on the line */}
                  <div
                    className="absolute -left-[5px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-md"
                    style={{ background: 'linear-gradient(135deg,#1565D8,#18B55A)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════
   EXPERTISE GRID
════════════════════════════════════════════════ */
function ExpertiseSection() {
  const { ref, visible } = useReveal(0.08)

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden" ref={ref}>
      <div className="container-max px-4 md:px-8">

        {/* Header */}
        <div
          className="text-center mb-12"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'none' : 'translateY(-24px)',
            transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green/8 border border-green/20 text-green text-[11px] font-bold uppercase tracking-widest mb-4">
            <Stethoscope size={11} />
            Clinical Expertise
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy">
            Areas of{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)' }}>
              Specialisation
            </span>
          </h2>
          <p className="text-text-secondary mt-3 max-w-xl mx-auto">
            Delivering comprehensive cardiac care through evidence-based practice and compassionate treatment.
          </p>
        </div>

        {/* Grid — staggered grow-in */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXPERTISE.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="group relative p-6 rounded-2xl border border-border bg-bg hover:bg-white hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(21,101,216,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'none' : 'translateY(32px) scale(0.96)',
                transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.08}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.08}s, box-shadow 0.3s ease, border-color 0.3s ease`,
              }}
            >
              {/* Hover accent top strip */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)' }}
                aria-hidden
              />
              {/* Hover glow corner */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />

              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-sm">
                <Icon size={22} className="text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-extrabold text-navy text-base mb-2 group-hover:text-primary transition-colors duration-200">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>

              {/* Bottom reveal CTA */}
              <div className="flex items-center gap-1 mt-4 text-[11px] font-bold text-primary opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                Learn more <ArrowRight size={10} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════
   MEMBERSHIPS + AWARDS
════════════════════════════════════════════════ */
function MembershipsAwards() {
  const { ref, visible } = useReveal(0.08)

  return (
    <section className="py-16 md:py-24 bg-bg overflow-hidden" ref={ref}>
      <div className="container-max px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Memberships — slide from left */}
          <div
            className="bg-white rounded-3xl border border-border shadow-sm p-8 hover:shadow-[0_8px_40px_rgba(21,101,216,0.10)] transition-shadow duration-300"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateX(-40px)',
              transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe size={18} className="text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-navy">Professional Memberships</h2>
            </div>
            <ul className="space-y-1">
              {MEMBERSHIPS.map((m, i) => (
                <li
                  key={m}
                  className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 group hover:bg-primary/3 rounded-xl px-2 -mx-2 transition-colors"
                  style={{
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'none' : 'translateX(-16px)',
                    transition: `opacity 0.5s ease ${0.2 + i * 0.08}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.08}s`,
                  }}
                >
                  <CheckCircle2 size={16} className="text-green shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-text-primary text-sm font-medium group-hover:text-navy transition-colors">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Awards — slide from right */}
          <div
            className="bg-white rounded-3xl border border-border shadow-sm p-8 hover:shadow-[0_8px_40px_rgba(21,101,216,0.10)] transition-shadow duration-300"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateX(40px)',
              transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Award size={18} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-extrabold text-navy">Awards &amp; Recognitions</h2>
            </div>
            <ul className="space-y-1">
              {AWARDS.map(({ year, title }, i) => (
                <li
                  key={title}
                  className="flex items-start gap-3 py-2.5 border-b border-border last:border-0 group hover:bg-amber-50/40 rounded-xl px-2 -mx-2 transition-colors"
                  style={{
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'none' : 'translateX(16px)',
                    transition: `opacity 0.5s ease ${0.2 + i * 0.08}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.08}s`,
                  }}
                >
                  <span className="text-[11px] font-extrabold text-primary bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-all">
                    {year}
                  </span>
                  <span className="text-text-primary text-sm font-medium leading-snug group-hover:text-navy transition-colors">{title}</span>
                  <Star size={12} className="text-amber-400 shrink-0 mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════
   HOSPITAL BANNER
════════════════════════════════════════════════ */
function HospitalBanner({ s }: { s: SiteSettings }) {
  const { ref, visible } = useReveal(0.1)
  if (!s.hospitalName) return null

  return (
    <section
      ref={ref}
      className="py-14 md:py-20 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 100%)' }}
    >
      <div className="container-max px-4 md:px-8">
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-8 text-white"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'none' : 'translateY(32px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"
              style={{ animation: visible ? 'floatY 4s ease-in-out infinite' : 'none' }}
            >
              <Building2 size={32} className="text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Practising at</p>
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">{s.hospitalName}</h3>
              {s.hospitalAddress && <p className="text-white/60 text-sm mt-1">{s.hospitalAddress}</p>}
            </div>
          </div>
          <div
            className="flex flex-wrap gap-3 shrink-0"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'none' : 'translateX(24px)',
              transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s',
            }}
          >
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-primary hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-lg"
            >
              Book Appointment <ArrowRight size={15} />
            </Link>
            {s.mapsLink && (
              <a
                href={s.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
              >
                Get Directions
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════
   BOTTOM CTA CARD
════════════════════════════════════════════════ */
function BottomCTA({ s }: { s: SiteSettings }) {
  const { ref, visible } = useReveal(0.15)

  return (
    <section className="py-12 bg-white" ref={ref}>
      <div className="container-max px-4 md:px-8">
        <div
          className="relative rounded-3xl bg-bg border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden hover:shadow-[0_8px_40px_rgba(21,101,216,0.10)] transition-shadow duration-300"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'none' : 'translateY(32px) scale(0.98)',
            transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease',
          }}
        >
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden />

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"
              style={{ animation: visible ? 'floatY 4s ease-in-out infinite' : 'none' }}
            >
              <Calendar size={26} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-navy">Ready to consult?</h3>
              <p className="text-text-secondary text-sm mt-0.5">
                Book a consultation with {s.doctorName || 'the doctor'} today.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white shadow-[0_4px_20px_rgba(21,101,216,0.30)] hover:shadow-[0_6px_28px_rgba(21,101,216,0.42)] hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6)' }}
            >
              Book Now <ArrowRight size={15} />
            </Link>
            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border-2 border-primary/25 text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all"
              >
                <Phone size={15} /> Call Now
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════
   MAIN EXPORT — assembles all animated sections
════════════════════════════════════════════════ */
export default function AboutClient({ s }: { s: SiteSettings }) {
  return (
    <>
      <HeroSection s={s} />
      <AchievementsStrip />
      <QualificationsSection />
      <ExpertiseSection />
      <MembershipsAwards />
      <HospitalBanner s={s} />
      <BottomCTA s={s} />
    </>
  )
}
