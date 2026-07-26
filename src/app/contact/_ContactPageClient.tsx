'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, Phone, Mail, Clock, MessageCircle,
  ArrowRight, Send, CheckCircle2, AlertCircle,
  Facebook, Instagram, Youtube, Linkedin, Twitter,
  Building2, Heart, Navigation,
} from 'lucide-react'
import type { SiteSettings, ClinicHour } from '@/types/firestore'

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

interface Props { settings: SiteSettings }

// ── Day order helper ──────────────────────────────────────────────────────────
const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function sortedHours(hours: ClinicHour[]) {
  return [...hours].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
}

function fmt(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`
}

// ── Contact form (client component) ──────────────────────────────────────────
function ContactForm({ settings }: Props) {
  const [form, setForm]       = useState({ name:'', phone:'', email:'', subject:'', message:'' })
  const [status, setStatus]   = useState<'idle'|'loading'|'success'|'error'>('idle')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) return
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Server error')
      setStatus('success')
      setForm({ name:'', phone:'', email:'', subject:'', message:'' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#18B55A]/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#18B55A]" />
        </div>
        <h3 className="text-xl font-extrabold text-[#143B7D]">Message Sent!</h3>
        <p className="text-[#6B7280] text-sm max-w-xs">
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-sm font-semibold text-[#1565D8] underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          Something went wrong. Please try again or call us directly.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#143B7D] mb-1.5 uppercase tracking-wide">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-[#DCE3EC] bg-[#F8FAFC] text-[#1F2937] text-sm placeholder-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 focus:border-[#1565D8] transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#143B7D] mb-1.5 uppercase tracking-wide">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            required
            placeholder="+91 XXXXX XXXXX"
            className="w-full px-4 py-3 rounded-xl border border-[#DCE3EC] bg-[#F8FAFC] text-[#1F2937] text-sm placeholder-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 focus:border-[#1565D8] transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#143B7D] mb-1.5 uppercase tracking-wide">
          Email Address
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          placeholder="you@email.com (optional)"
          className="w-full px-4 py-3 rounded-xl border border-[#DCE3EC] bg-[#F8FAFC] text-[#1F2937] text-sm placeholder-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 focus:border-[#1565D8] transition"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#143B7D] mb-1.5 uppercase tracking-wide">
          Subject
        </label>
        <select
          value={form.subject}
          onChange={e => set('subject', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#DCE3EC] bg-[#F8FAFC] text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 focus:border-[#1565D8] transition"
        >
          <option value="">Select a subject</option>
          <option value="appointment">Appointment Enquiry</option>
          <option value="report">Report / Second Opinion</option>
          <option value="assistance">Patient Assistance</option>
          <option value="ngo">NGO Partnership</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#143B7D] mb-1.5 uppercase tracking-wide">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          required
          rows={4}
          placeholder="How can we help you?"
          className="w-full px-4 py-3 rounded-xl border border-[#DCE3EC] bg-[#F8FAFC] text-[#1F2937] text-sm placeholder-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#1565D8]/30 focus:border-[#1565D8] transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white disabled:opacity-70 transition shadow-[0_4px_20px_rgba(21,101,216,0.25)] hover:shadow-[0_6px_28px_rgba(21,101,216,0.38)]"
        style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6)' }}
      >
        {status === 'loading' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <><Send size={15} /> Send Message</>
        )}
      </button>

      <p className="text-center text-[11px] text-[#6B7280]">
        We respond within 24 hours. For urgent care, please call directly.
      </p>
    </form>
  )
}

// ── Main client page ──────────────────────────────────────────────────────────
export default function ContactPageClient({ settings }: Props) {
  const s      = settings
  const hours  = sortedHours(s.clinicHours ?? [])
  const today  = DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  const SOCIALS = [
    { key:'facebook',  icon: Facebook,  label:'Facebook',  href: s.facebook  },
    { key:'instagram', icon: Instagram, label:'Instagram', href: s.instagram },
    { key:'youtube',   icon: Youtube,   label:'YouTube',   href: s.youtube   },
    { key:'linkedin',  icon: Linkedin,  label:'LinkedIn',  href: s.linkedin  },
    { key:'twitter',   icon: Twitter,   label:'Twitter',   href: s.twitter   },
  ].filter(sc => sc.href)

  return (
    <>
      {/* ══════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg,#143B7D 0%,#1565D8 60%,#18B55A 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
          <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1200 60" fill="none" preserveAspectRatio="none">
            <polyline
              points="0,30 200,30 220,5 240,55 260,30 560,30 580,5 600,55 620,30 820,30 840,10 860,50 880,30 1200,30"
              stroke="white" strokeWidth="1.5" fill="none"
            />
          </svg>
        </div>
        <div className="container-max px-4 md:px-8 relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-5">
            <Heart size={11} className="fill-white text-white" />
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Reach out for appointments, second opinions, or any cardiac health enquiry.
            Our team responds within 24 hours.
          </p>
          {/* Quick action pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1565D8] font-bold text-sm hover:bg-white/90 transition shadow-lg"
              >
                <Phone size={15} /> Call Now
              </a>
            )}
            {s.whatsapp && (
              <a
                href={`https://wa.me/${s.whatsapp.replace(/\D/g,'')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18B55A] text-white font-bold text-sm hover:bg-[#18B55A]/90 transition shadow-lg"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/30 text-white font-bold text-sm hover:bg-white/10 transition"
            >
              Book Appointment <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONTACT CARDS ROW
      ══════════════════════════════════════════════ */}
      <section className="py-12 bg-[#F8FAFC]">
        <div className="container-max px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Address */}
            {s.address && (
              <div className="bg-white rounded-2xl border border-[#DCE3EC] p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:border-[#1565D8]/30 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#1565D8]/10 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#1565D8]" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wide mb-1">Address</p>
                  <p className="text-[#1F2937] text-sm font-medium leading-snug">{s.address}</p>
                  {s.mapsLink && (
                    <a href={s.mapsLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1565D8] mt-2 hover:underline">
                      <Navigation size={10} /> Get Directions
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Phone */}
            {s.phone && (
              <div className="bg-white rounded-2xl border border-[#DCE3EC] p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:border-[#1565D8]/30 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#18B55A]/10 flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-[#18B55A]" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wide mb-1">Phone</p>
                  <a href={`tel:${s.phone}`} className="text-[#1F2937] text-sm font-semibold hover:text-[#1565D8] transition block">{s.phone}</a>
                  {s.phoneAlt && (
                    <a href={`tel:${s.phoneAlt}`} className="text-[#6B7280] text-xs hover:text-[#1565D8] transition block mt-0.5">{s.phoneAlt}</a>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            {s.email && (
              <div className="bg-white rounded-2xl border border-[#DCE3EC] p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:border-[#1565D8]/30 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#18B8E6]/10 flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-[#18B8E6]" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wide mb-1">Email</p>
                  <a href={`mailto:${s.email}`} className="text-[#1F2937] text-sm font-semibold hover:text-[#1565D8] transition break-all">{s.email}</a>
                  {s.emailAlt && (
                    <a href={`mailto:${s.emailAlt}`} className="text-[#6B7280] text-xs hover:text-[#1565D8] transition block mt-0.5 break-all">{s.emailAlt}</a>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp */}
            {s.whatsapp && (
              <div className="bg-white rounded-2xl border border-[#DCE3EC] p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:border-[#18B55A]/30 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#18B55A]/10 flex items-center justify-center shrink-0">
                  <MessageCircle size={20} className="text-[#18B55A]" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wide mb-1">WhatsApp</p>
                  <a
                    href={`https://wa.me/${s.whatsapp.replace(/\D/g,'')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1F2937] text-sm font-semibold hover:text-[#18B55A] transition"
                  >
                    {s.whatsapp}
                  </a>
                  <p className="text-[#6B7280] text-[11px] mt-0.5">Chat with us instantly</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MAP + FORM + HOURS  (3-column layout)
      ══════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="container-max px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT: Map + Clinic Hours (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Google Maps — uses Embed API v1 with our API key + clinic address */}
              {(() => {
                // Build the best embed URL we can
                const embedSrc = s.mapsEmbedUrl
                  ? s.mapsEmbedUrl  // admin-saved URL (from Settings → auto-generate or manual)
                  : s.address && MAPS_API_KEY
                    ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodeURIComponent(s.address)}&zoom=16`
                    : null

                return embedSrc ? (
                  <div
                    className="rounded-2xl overflow-hidden border border-[#DCE3EC] shadow-sm relative group"
                    style={{ height: 280 }}
                  >
                    <iframe
                      key={embedSrc}
                      src={embedSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Clinic Location — UpBeat Heart"
                    />
                    {/* Floating "Get Directions" overlay button */}
                    {(s.mapsLink || s.address) && (
                      <a
                        href={s.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-[#1565D8] shadow-lg border border-[#DCE3EC] hover:bg-[#1565D8] hover:text-white hover:border-[#1565D8] transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Navigation size={12} /> Get Directions
                      </a>
                    )}
                  </div>
                ) : (
                  <div
                    className="rounded-2xl flex flex-col items-center justify-center border border-[#DCE3EC] shadow-sm text-center p-8 gap-3"
                    style={{ height: 280, background: 'linear-gradient(135deg,#F8FAFC,#EBF0FB)' }}
                  >
                    <MapPin size={40} className="text-[#1565D8]/40" />
                    <p className="text-[#6B7280] text-sm font-medium">Location map coming soon</p>
                    {s.mapsLink && (
                      <a href={s.mapsLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1565D8] hover:underline">
                        <Navigation size={13} /> Open in Google Maps
                      </a>
                    )}
                  </div>
                )
              })()}

              {/* Clinic Hours */}
              <div className="bg-[#F8FAFC] rounded-2xl border border-[#DCE3EC] shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#DCE3EC] bg-white">
                  <div className="w-9 h-9 rounded-xl bg-[#1565D8]/10 flex items-center justify-center">
                    <Clock size={16} className="text-[#1565D8]" />
                  </div>
                  <h3 className="font-extrabold text-[#143B7D] text-sm">Clinic Hours</h3>
                </div>
                <ul className="divide-y divide-[#DCE3EC]">
                  {hours.map(h => {
                    const isToday = h.day === today
                    return (
                      <li
                        key={h.day}
                        className={`flex items-center justify-between px-5 py-3 text-sm ${isToday ? 'bg-[#1565D8]/4' : ''}`}
                      >
                        <span className={`font-semibold ${isToday ? 'text-[#1565D8]' : 'text-[#1F2937]'}`}>
                          {h.day}
                          {isToday && <span className="ml-2 text-[10px] font-extrabold text-[#1565D8] bg-[#1565D8]/10 px-1.5 py-0.5 rounded-full">Today</span>}
                        </span>
                        {h.closed ? (
                          <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">Closed</span>
                        ) : (
                          <span className={`font-medium ${isToday ? 'text-[#1565D8] font-bold' : 'text-[#6B7280]'}`}>
                            {fmt(h.open)} – {fmt(h.close)}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Hospital badge */}
              {s.hospitalName && (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#143B7D] text-white shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Building2 size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Located at</p>
                    <p className="font-extrabold text-white leading-tight">{s.hospitalName}</p>
                    {s.hospitalAddress && (
                      <p className="text-white/60 text-xs mt-0.5 leading-snug">{s.hospitalAddress}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Contact form (3 cols) */}
            <div className="lg:col-span-3">
              <div className="bg-[#F8FAFC] rounded-2xl border border-[#DCE3EC] shadow-sm p-6 md:p-8 h-full">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1565D8]/8 border border-[#1565D8]/15 text-[#1565D8] text-[11px] font-bold uppercase tracking-widest mb-3">
                    <Send size={11} />
                    Send a Message
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#143B7D] leading-tight">
                    How can we help you?
                  </h2>
                  <p className="text-[#6B7280] text-sm mt-1">
                    Fill the form and our team will get back within 24 hours.
                  </p>
                </div>
                <ContactForm settings={settings} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL MEDIA
      ══════════════════════════════════════════════ */}
      {SOCIALS.length > 0 && (
        <section className="py-12 bg-[#F8FAFC]">
          <div className="container-max px-4 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#143B7D]">Follow Us</h2>
              <p className="text-[#6B7280] text-sm mt-1">Stay connected for heart health tips and updates</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-[#DCE3EC] text-[#1F2937] font-semibold text-sm hover:border-[#1565D8]/40 hover:text-[#1565D8] hover:shadow-md transition-all duration-200 group"
                >
                  <Icon size={18} className="text-[#6B7280] group-hover:text-[#1565D8] transition-colors" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          APPOINTMENT CTA
      ══════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="container-max px-4 md:px-8">
          <div
            className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white"
            style={{ background: 'linear-gradient(135deg,#143B7D 0%,#1565D8 60%,#18B55A 100%)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <Heart size={26} className="text-white fill-white/30" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold leading-tight">Need Cardiac Care?</h3>
                <p className="text-white/70 text-sm mt-0.5">Book a consultation and take the first step to a healthier heart.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-[#1565D8] hover:bg-white/90 transition shadow-lg"
              >
                Book Appointment <ArrowRight size={15} />
              </Link>
              {s.phone && (
                <a
                  href={`tel:${s.phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition"
                >
                  <Phone size={15} /> Call Us
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
