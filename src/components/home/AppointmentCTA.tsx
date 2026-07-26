'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  CalendarCheck, Phone, Clock, MessageCircle,
  ArrowRight, CheckCircle, Heart, Stethoscope, ShieldCheck,
} from 'lucide-react'
import type { SiteSettings, ClinicHour } from '@/types/firestore'

interface Props { settings: SiteSettings }

const DAYS_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}
const TODAY_NAME = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][
  new Date().getDay()
]

/* Animated ECG SVG line */
function ECGPulseLine() {
  return (
    <svg
      viewBox="0 0 400 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md mx-auto"
      aria-hidden
    >
      <style>{`
        @keyframes ecgDraw {
          0%   { stroke-dashoffset: 900; opacity: 0 }
          10%  { opacity: 1 }
          70%  { stroke-dashoffset: 0; opacity: 1 }
          85%  { opacity: 1 }
          100% { stroke-dashoffset: -900; opacity: 0 }
        }
        .ecg-path {
          stroke-dasharray: 900;
          animation: ecgDraw 3.5s cubic-bezier(0.4,0,0.2,1) infinite;
        }
      `}</style>
      <path
        className="ecg-path"
        d="M0 35 L60 35 L75 35 L82 20 L90 52 L98 10 L106 52 L114 20 L121 35 L140 35 L160 35 L175 35 L182 22 L190 48 L198 12 L206 48 L214 22 L221 35 L260 35 L400 35"
        stroke="#1565D8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* Clinic hours table */
function HoursTable({ hours }: { hours: ClinicHour[] }) {
  if (!hours?.length) return null
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
      {hours.map((h, i) => {
        const isToday = h.day === TODAY_NAME
        return (
          <div
            key={h.day}
            className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-center transition-all duration-300 ${
              isToday
                ? 'bg-primary text-white shadow-[0_4px_16px_rgba(21,101,216,0.30)]'
                : h.closed
                ? 'bg-gray-50 border border-[#DCE3EC]'
                : 'bg-[#F8FAFC] border border-[#DCE3EC] hover:border-primary/30 hover:bg-blue-50/50'
            }`}
            style={{ transitionDelay: String(i * 40) + 'ms' }}
          >
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              isToday ? 'text-white/80' : 'text-[#6B7280]'
            }`}>
              {DAYS_SHORT[h.day] ?? h.day}
              {isToday && <span className="ml-1">&#9679;</span>}
            </span>
            <span className={`text-[10px] font-bold leading-tight ${
              isToday ? 'text-white' : h.closed ? 'text-[#6B7280]' : 'text-[#1F2937]'
            }`}>
              {h.closed ? 'Closed' : h.open}
            </span>
            {!h.closed && (
              <span className={`text-[9px] ${isToday ? 'text-white/70' : 'text-[#6B7280]'}`}>
                {h.close}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* Trust badge card */
function TrustCard({
  icon, label, delay,
}: {
  icon: React.ReactNode
  label: string
  delay: number
}) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className="flex items-center gap-2.5 bg-white border border-[#DCE3EC] rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(21,101,216,0.07)]"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'none' : 'translateY(12px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <span className="text-primary shrink-0">{icon}</span>
      <span className="text-[12px] font-semibold text-[#1F2937]">{label}</span>
    </div>
  )
}

export default function AppointmentCTA({ settings }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [beatAnim, setBeatAnim] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.08 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const triggerBeat = () => {
    setBeatAnim(true)
    setTimeout(() => setBeatAnim(false), 700)
  }

  const isOpen = settings.appointmentsOpen ?? true
  const whatsappUrl = settings.whatsapp
    ? 'https://wa.me/' + settings.whatsapp.replace(/\D/g, '') + '?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment'
    : null

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(32px)',
    transition:
      'opacity 0.7s cubic-bezier(0.22,1,0.36,1) ' + delay + 'ms, ' +
      'transform 0.7s cubic-bezier(0.22,1,0.36,1) ' + delay + 'ms',
  })

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-20 md:py-28 bg-white relative overflow-hidden"
    >
      {/* Dot-grid background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="apptDots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="14" cy="14" r="0.8" fill="#1565D8" opacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#apptDots)" />
        </svg>
      </div>

      {/* Glow blobs */}
      <div
        className="absolute -top-20 right-0 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(21,101,216,0.06) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute -bottom-20 left-0 w-[340px] h-[340px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(24,181,90,0.06) 0%, transparent 70%)' }}
        aria-hidden
      />

      {/* Top accent border */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #1565D8 0%, #18B8E6 50%, #18B55A 100%)' }}
        aria-hidden
      />

      <div className="container-max px-4 md:px-8 relative z-10">

        {/* Label pill */}
        <div className="flex justify-center mb-8" style={fadeUp(0)}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest">
            <CalendarCheck size={12} />
            Book an Appointment
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-4" style={fadeUp(80)}>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#143B7D] leading-tight tracking-tight">
            Your Heart Deserves
            <span
              className="relative inline-block ml-3 cursor-pointer select-none"
              onMouseEnter={triggerBeat}
            >
              <span
                className="text-primary"
                style={{
                  display: 'inline-block',
                  transform: beatAnim ? 'scale(1.15)' : 'scale(1)',
                  transition: beatAnim
                    ? 'transform 0.12s ease-out'
                    : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                Expert Care
              </span>
            </span>
          </h2>
        </div>

        {/* ECG line */}
        <div className="mb-6" style={fadeUp(140)}>
          {visible && <ECGPulseLine />}
        </div>

        {/* Subtitle */}
        <div className="text-center mb-10" style={fadeUp(180)}>
          <p className="text-[#6B7280] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {isOpen
              ? "Book your consultation in minutes  -- no registration required. We'll confirm your slot within 2 hours."
              : (settings.appointmentNote || 'Online booking is temporarily unavailable. Please call us directly.')}
          </p>
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          style={fadeUp(240)}
        >
          {isOpen ? (
            <>
              <Link
                href="/appointment"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-primary text-white hover:bg-primary/90 shadow-[0_6px_28px_rgba(21,101,216,0.30)] hover:shadow-[0_10px_36px_rgba(21,101,216,0.42)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <CalendarCheck size={18} />
                Book Appointment Online
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-white text-[#1F2937] border border-[#DCE3EC] hover:border-primary/30 hover:bg-[#F8FAFC] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(21,101,216,0.12)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <MessageCircle size={18} className="text-[#18B55A]" />
                  WhatsApp Us
                </a>
              )}
            </>
          ) : (
            <a
              href={'tel:' + settings.phone}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-primary text-white hover:bg-primary/90 shadow-[0_6px_28px_rgba(21,101,216,0.28)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <Phone size={18} />
              {'Call ' + (settings.phone || 'Us Now')}
            </a>
          )}
        </div>

        {/* Trust badges */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
          style={fadeUp(300)}
        >
          {visible && (
            <>
              <TrustCard icon={<ShieldCheck size={14} />} label="No account needed"         delay={350} />
              <TrustCard icon={<CheckCircle  size={14} />} label="Confirmed within 2 hrs"   delay={430} />
              <TrustCard icon={<Heart        size={14} />} label="Free first-visit guidance" delay={510} />
              <TrustCard icon={<Stethoscope  size={14} />} label="Secure and private"       delay={590} />
            </>
          )}
        </div>

        {/* Clinic hours */}
        {settings.clinicHours?.length > 0 && (
          <div className="max-w-2xl mx-auto" style={fadeUp(360)}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock size={13} className="text-[#6B7280]" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">
                Clinic Hours
              </p>
            </div>
            {visible && <HoursTable hours={settings.clinicHours} />}
          </div>
        )}

        {/* Emergency note */}
        {settings.phone && (
          <div className="flex items-center justify-center gap-2 mt-10" style={fadeUp(420)}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[12px] text-[#6B7280]">
              Cardiac emergency?{' '}
              <a
                href={'tel:' + settings.phone}
                className="text-primary font-bold hover:underline underline-offset-2 transition-colors"
              >
                {'Call ' + settings.phone + ' immediately'}
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

