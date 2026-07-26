'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Phone, Calendar } from 'lucide-react'
import type { LegalSection } from '@/types/firestore'
import type { SiteSettings } from '@/types/firestore'

interface Props {
  title:         string
  subtitle:      string
  effectiveDate: string
  sections:      LegalSection[]
  settings:      SiteSettings
  accentColor:   string   // tailwind/hex class for theming
  heroGradient:  string   // inline gradient string
  eyebrowIcon:   React.ReactNode
  eyebrowLabel:  string
}

// Render body: **bold**, \n\n = paragraph, bullet lines (• or -) = list
function renderBody(text: string) {
  return text.split('\n\n').map((para, pi) => {
    // Bullet block detection
    const lines = para.split('\n')
    const isBulletBlock = lines.every(l => /^[•\-\*]\s/.test(l.trim()))

    if (isBulletBlock) {
      return (
        <ul key={pi} className="space-y-1.5 mb-4 last:mb-0">
          {lines.map((line, li) => (
            <li key={li} className="flex items-start gap-2.5 text-sm text-[#1F2937] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1565D8] mt-2 shrink-0" />
              <span dangerouslySetInnerHTML={{
                __html: line.replace(/^[•\-\*]\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              }} />
            </li>
          ))}
        </ul>
      )
    }

    const html = para
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#1F2937] font-semibold">$1</strong>')
      .replace(/\n/g, '<br />')

    return (
      <p
        key={pi}
        className="text-sm text-[#6B7280] leading-relaxed mb-4 last:mb-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  })
}

export default function LegalPageLayout({
  title, subtitle, effectiveDate, sections, settings,
  accentColor, heroGradient, eyebrowIcon, eyebrowLabel,
}: Props) {
  const [activeSection, setActiveSection] = useState<string>('')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const s = settings

  // Intersection observer to highlight the active TOC item
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [sections])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 md:py-24" style={{ background: heroGradient }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-white/5 blur-3xl" />
          <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1200 60" fill="none" preserveAspectRatio="none">
            <polyline points="0,30 200,30 220,5 240,55 260,30 560,30 580,5 600,55 620,30 820,30 840,10 860,50 880,30 1200,30"
              stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="container-max px-4 md:px-8 relative z-10 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-5">
            {eyebrowIcon}
            {eyebrowLabel}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-2xl">{title}</h1>
          <p className="text-white/75 text-base max-w-xl leading-relaxed mb-4">{subtitle}</p>
          {effectiveDate && (
            <p className="inline-flex items-center gap-2 text-sm text-white/60 bg-white/10 border border-white/15 px-4 py-2 rounded-full font-medium">
              <Calendar size={13} />
              Effective Date: {effectiveDate}
            </p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONTENT — sticky TOC left + sections right
      ══════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-[#F8FAFC]">
        <div className="container-max px-4 md:px-8">
          {sections.length === 0 ? (
            <div className="text-center py-20 text-[#6B7280]">
              <p className="text-base font-medium">Content coming soon.</p>
              <p className="text-sm mt-1">Please check back later.</p>
            </div>
          ) : (
            <div className="flex gap-10 flex-col lg:flex-row">

              {/* ─── LEFT: Sticky Table of Contents ─── */}
              <aside className="lg:w-60 shrink-0">
                <div className="lg:sticky lg:top-24">
                  <p className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-3 px-1">
                    Table of Contents
                  </p>
                  <nav className="space-y-0.5">
                    {sections.map(sec => {
                      const isActive = activeSection === `sec-${sec.id}`
                      return (
                        <button
                          key={sec.id}
                          onClick={() => scrollTo(`sec-${sec.id}`)}
                          className={`w-full text-left text-xs px-3 py-2 rounded-xl font-medium transition-all duration-150 leading-snug ${
                            isActive
                              ? 'bg-[#1565D8] text-white shadow-md shadow-[#1565D8]/20'
                              : 'text-[#6B7280] hover:text-[#1565D8] hover:bg-white'
                          }`}
                        >
                          {sec.heading}
                        </button>
                      )
                    })}
                  </nav>

                  {/* Quick contact */}
                  <div className="mt-6 p-4 rounded-2xl bg-white border border-[#DCE3EC] space-y-3">
                    <p className="text-xs font-extrabold text-[#143B7D]">Questions?</p>
                    <Link href="/contact"
                      className="flex items-center gap-2 text-xs font-semibold text-[#1565D8] hover:underline">
                      Contact Us <ArrowRight size={11} />
                    </Link>
                    {s.phone && (
                      <a href={`tel:${s.phone}`}
                        className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#1565D8] transition">
                        <Phone size={11} /> {s.phone}
                      </a>
                    )}
                  </div>
                </div>
              </aside>

              {/* ─── RIGHT: Sections ─── */}
              <div className="flex-1 min-w-0 space-y-6">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    id={`sec-${sec.id}`}
                    ref={el => { sectionRefs.current[`sec-${sec.id}`] = el }}
                    className="bg-white rounded-2xl border border-[#DCE3EC] shadow-sm p-6 md:p-8 scroll-mt-28 hover:border-[#1565D8]/20 transition-colors duration-200"
                  >
                    {/* Section number badge + heading */}
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold shrink-0"
                        style={{ background: 'linear-gradient(135deg,#1565D8,#18B8E6)' }}
                      >
                        {idx + 1}
                      </div>
                      <h2 className="text-lg font-extrabold text-[#143B7D] leading-snug pt-1">
                        {sec.heading}
                      </h2>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-[#1565D8]/20 via-[#18B8E6]/10 to-transparent mb-5" />

                    {/* Body */}
                    <div className="space-y-0">
                      {renderBody(sec.body)}
                    </div>
                  </div>
                ))}

                {/* Back to top */}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-xs font-semibold text-[#6B7280] hover:text-[#1565D8] transition flex items-center gap-1.5 mt-2"
                >
                  ↑ Back to top
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA FOOTER BANNER
      ══════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="container-max px-4 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-[#F8FAFC] border border-[#DCE3EC]">
            <div>
              <p className="font-extrabold text-[#143B7D] text-base">Need expert cardiac care?</p>
              <p className="text-[#6B7280] text-sm mt-0.5">Book a consultation with {s.doctorName || 'our cardiologist'} today.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/appointment"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-[0_4px_20px_rgba(21,101,216,0.25)] hover:opacity-95 transition"
                style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6)' }}>
                Book Appointment <ArrowRight size={14} />
              </Link>
              <Link href="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 border-[#1565D8]/25 text-[#1565D8] hover:bg-[#1565D8] hover:text-white transition">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
