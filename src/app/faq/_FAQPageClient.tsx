'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle, ChevronDown, ChevronUp, Search,
  Heart, ArrowRight, MessageCircle, Phone,
  Tag, Calendar, CreditCard, Users, Stethoscope,
  Smartphone, Shield, Settings,
} from 'lucide-react'
import type { FAQItem } from '@/types/firestore'
import type { SiteSettings } from '@/types/firestore'

interface Props {
  items: FAQItem[]
  settings: SiteSettings
}

// ── Category icon map ─────────────────────────────────────────────────────────
const CAT_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'General':                     { icon: HelpCircle,   color: 'text-[#1565D8]',   bg: 'bg-[#1565D8]/8'  },
  'Appointments':                { icon: Calendar,     color: 'text-[#18B8E6]',   bg: 'bg-[#18B8E6]/10' },
  'Donations & Payments':        { icon: CreditCard,   color: 'text-[#18B55A]',   bg: 'bg-[#18B55A]/10' },
  'Patient Assistance Campaigns':{ icon: Heart,        color: 'text-rose-500',    bg: 'bg-rose-50'       },
  'NGO Partnerships':            { icon: Users,        color: 'text-purple-600',  bg: 'bg-purple-50'     },
  'Doctor App':                  { icon: Smartphone,   color: 'text-amber-600',   bg: 'bg-amber-50'      },
  'Data & Privacy':              { icon: Shield,       color: 'text-[#143B7D]',   bg: 'bg-[#143B7D]/8'  },
  'Technical':                   { icon: Settings,     color: 'text-[#6B7280]',   bg: 'bg-[#6B7280]/10' },
}

function getCatMeta(cat: string) {
  return CAT_META[cat] ?? { icon: Tag, color: 'text-[#1565D8]', bg: 'bg-[#1565D8]/8' }
}

// ── Single accordion item ─────────────────────────────────────────────────────
function FAQAccordion({ item, idx }: { item: FAQItem; idx: number }) {
  const [open, setOpen] = useState(false)
  const meta = getCatMeta(item.category)
  const Icon = meta.icon

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        open
          ? 'border-[#1565D8]/30 shadow-[0_4px_24px_rgba(21,101,216,0.08)] bg-white'
          : 'border-[#DCE3EC] bg-white hover:border-[#1565D8]/25 hover:shadow-sm'
      }`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        {/* Index + icon */}
        <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon size={16} className={meta.color} />
        </div>

        {/* Question */}
        <span className="flex-1 text-[#1F2937] text-sm font-semibold leading-snug pr-2">
          {item.question}
        </span>

        {/* Chevron */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          open ? 'bg-[#1565D8] text-white' : 'bg-[#F8FAFC] text-[#6B7280]'
        }`}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Answer */}
      {open && (
        <div className="px-5 pb-5 pt-0">
          <div className="ml-13 pl-4 border-l-2 border-[#1565D8]/20" style={{ marginLeft: '52px' }}>
            <p className="text-[#6B7280] text-sm leading-relaxed">{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main client page ──────────────────────────────────────────────────────────
export default function FAQPageClient({ items, settings }: Props) {
  const [search, setSearch]     = useState('')
  const [activeTab, setActiveTab] = useState('All')

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]

  const filtered = items.filter(item => {
    const matchCat    = activeTab === 'All' || item.category === activeTab
    const matchSearch = !search || [item.question, item.answer, item.category]
      .join(' ').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Group filtered items by category
  const grouped = filtered.reduce<Record<string, FAQItem[]>>((acc, item) => {
    ;(acc[item.category] = acc[item.category] || []).push(item)
    return acc
  }, {})

  const s = settings

  return (
    <>
      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg,#143B7D 0%,#1565D8 60%,#18B55A 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-white/5 blur-3xl" />
          <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1200 60" fill="none" preserveAspectRatio="none">
            <polyline points="0,30 200,30 220,5 240,55 260,30 560,30 580,5 600,55 620,30 820,30 840,10 860,50 880,30 1200,30"
              stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="container-max px-4 md:px-8 relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-5">
            <HelpCircle size={11} />
            Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto mb-8">
            Find answers to common questions about appointments, donations, campaigns, and more.
          </p>

          {/* Search bar */}
          <div className="max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[#1F2937] text-sm font-medium bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-[#18B8E6]/50 placeholder-[#6B7280]/60"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Result count on search */}
          {search && (
            <p className="text-white/60 text-sm mt-3">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{search}&quot;
            </p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATEGORY TABS + FAQ CONTENT
      ══════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-[#F8FAFC]">
        <div className="container-max px-4 md:px-8">
          <div className="flex gap-8 flex-col lg:flex-row">

            {/* LEFT: Sticky category sidebar */}
            <aside className="lg:w-56 shrink-0">
              <div className="lg:sticky lg:top-24 space-y-1">
                <p className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-widest px-2 mb-3">Categories</p>
                {categories.map(cat => {
                  const meta   = cat === 'All' ? null : getCatMeta(cat)
                  const Icon   = meta?.icon ?? HelpCircle
                  const count  = cat === 'All' ? filtered.length : filtered.filter(i => i.category === cat).length
                  const active = activeTab === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all duration-150 ${
                        active
                          ? 'bg-[#1565D8] text-white shadow-md shadow-[#1565D8]/25'
                          : 'text-[#1F2937] hover:bg-white hover:text-[#1565D8] hover:shadow-sm'
                      }`}
                    >
                      <Icon size={15} className={active ? 'text-white' : (meta?.color ?? 'text-[#1565D8]')} />
                      <span className="flex-1 truncate">{cat}</span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-[#DCE3EC] text-[#6B7280]'
                      }`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* RIGHT: FAQ list */}
            <div className="flex-1 min-w-0">
              {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#DCE3EC]/60 flex items-center justify-center">
                    <Search size={28} className="text-[#6B7280]/40" />
                  </div>
                  <p className="text-[#1F2937] font-semibold">No results found</p>
                  <p className="text-[#6B7280] text-sm max-w-xs">
                    Try a different search term, or{' '}
                    <button onClick={() => setSearch('')} className="text-[#1565D8] underline underline-offset-2">clear the search</button>.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(grouped).map(([cat, catItems]) => {
                    const meta = getCatMeta(cat)
                    const Icon = meta.icon
                    return (
                      <div key={cat}>
                        {/* Category heading */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center`}>
                            <Icon size={15} className={meta.color} />
                          </div>
                          <h2 className="text-base font-extrabold text-[#143B7D]">{cat}</h2>
                          <span className="text-xs font-bold text-[#6B7280] bg-[#DCE3EC]/80 px-2 py-0.5 rounded-full">
                            {catItems.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {catItems.map((item, idx) => (
                            <FAQAccordion key={item.id} item={item} idx={idx} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Still have questions? */}
              <div className="mt-12 rounded-3xl p-8 text-center"
                style={{ background: 'linear-gradient(135deg,#143B7D 0%,#1565D8 100%)' }}>
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">Still have questions?</h3>
                <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
                  Can&apos;t find what you&apos;re looking for? Reach out — we&apos;re happy to help.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1565D8] text-sm font-bold hover:bg-white/90 transition shadow-md">
                    Contact Us <ArrowRight size={14} />
                  </Link>
                  {s.whatsapp && (
                    <a
                      href={`https://wa.me/${s.whatsapp.replace(/\D/g,'')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/30 text-white text-sm font-bold hover:bg-white/10 transition"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                  {s.phone && (
                    <a href={`tel:${s.phone}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-white/30 text-white text-sm font-bold hover:bg-white/10 transition">
                      <Phone size={14} /> Call Us
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
