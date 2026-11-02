'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Heart, Shield, ArrowRight, TrendingUp, Search, X,
  ChevronRight, Home, Users, CheckCircle, Target,
  Sparkles, HandHeart,
} from 'lucide-react'
import type { Campaign } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'
import { cld } from '@/lib/cloudinary'
import useScrollReveal from '@/hooks/useScrollReveal'
import Reveal from '@/components/ui/Reveal'

// ─── Animated progress bar ────────────────────────────────────────────────────
function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ offset: 0.05 })
  const [pct, setPct] = useState(0)
  const target = Math.min(Math.round((raised / Math.max(goal, 1)) * 100), 100)

  // Fill on every pass: count up whenever the bar comes into view and rewind to
  // zero once it leaves, so it fills again next time instead of sitting full.
  useEffect(() => {
    if (!visible) { setPct(0); return }
    let frame = 0
    const start = performance.now()
    const dur   = 1200
    const tick  = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 3) // ease-out-cubic
      setPct(Math.round(ease * target))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, target])

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between items-center text-[11px] font-semibold">
        <span className="text-green font-bold">₹{raised.toLocaleString('en-IN')} raised</span>
        <span className="text-text-secondary">{target}% of ₹{goal.toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-none"
          style={{
            width:      `${pct}%`,
            background: 'linear-gradient(90deg, #1565D8 0%, #18B8E6 50%, #18B55A 100%)',
            boxShadow:  pct > 0 ? '0 0 8px rgba(24,181,90,0.4)' : 'none',
          }}
        />
      </div>
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimCounter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const { ref, visible } = useScrollReveal<HTMLSpanElement>({ offset: 0.05 })
  const [val, setVal] = useState(0)

  // Same replay contract as the progress bar — counts up on entry, resets on
  // exit, so the number is never stuck at its final value on a second pass.
  useEffect(() => {
    if (!visible) { setVal(0); return }
    let frame = 0
    const start = performance.now()
    const dur   = 1400
    const tick  = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * to))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, to])

  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}

// ─── Campaign card ─────────────────────────────────────────────────────────────
function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const photo      = campaign.photos?.[0] ?? ''
  const firstName  = campaign.patientName?.split(' ')[0] ?? 'Patient'
  const pct        = Math.min(Math.round(((campaign.amountRaised ?? 0) / Math.max(campaign.estimatedCost ?? 1, 1)) * 100), 100)
  const isComplete = pct >= 100

  return (
    // The reveal lives on a wrapper so the card keeps its own class-based hover
    // transition — an inline reveal transition would swallow it.
    <Reveal effect="fade-up" delay={index * 80} offset={0.1} className="h-full">
      <div
        className="group relative flex flex-col h-full bg-white rounded-2xl border border-border overflow-hidden shadow-sm
          hover:shadow-[0_12px_48px_rgba(21,101,216,0.14)] hover:border-primary/25 transition-all duration-500"
      >
        {/* Top gradient line on hover */}
        <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image — campaign photos are free-form uploads, so a fixed h-48 in a
            ~430px column (2.22:1) sliced a third off every photo. */}
        <div className="relative aspect-[4/3] overflow-hidden bg-bg shrink-0">
          {photo ? (
            <LazyImage
              src={cld.cover(photo)}
              alt={`${firstName}'s campaign`}
              revealBlur
              revealScale
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full gradient-dark flex items-center justify-center">
              <Heart size={48} className="text-white/20" fill="currentColor" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {campaign.doctorVerified && (
              <span className="flex items-center gap-1 bg-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                <Shield size={9} /> Verified
              </span>
            )}
            {isComplete && (
              <span className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                <CheckCircle size={9} /> Funded
              </span>
            )}
          </div>

          {/* Status pill */}
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg ${
              campaign.status === 'active'    ? 'bg-green/90 text-white' :
              campaign.status === 'completed' ? 'bg-navy/80 text-white'  :
              'bg-primary/90 text-white'
            }`}>
              {campaign.status === 'active' ? '🟢 Active' : campaign.status === 'completed' ? '✓ Completed' : 'Open'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-navy leading-tight group-hover:text-primary transition-colors mb-1">
              Help {firstName} fight {campaign.diagnosis}
            </h3>
            {campaign.hospital && (
              <p className="text-[11px] text-text-secondary font-medium">{campaign.hospital}</p>
            )}
          </div>

          {campaign.patientStory && (
            <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">
              {campaign.patientStory.replace(/<[^>]*>/g, '').slice(0, 130)}…
            </p>
          )}

          <ProgressBar raised={campaign.amountRaised ?? 0} goal={campaign.estimatedCost ?? 1} />

          {/* Raised / Goal */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-secondary">Goal: <span className="font-bold text-navy">₹{(campaign.estimatedCost ?? 0).toLocaleString('en-IN')}</span></span>
            {(campaign.updates?.length ?? 0) > 0 && (
              <span className="text-text-secondary">{campaign.updates!.length} update{campaign.updates!.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex gap-2 pt-1">
            <Link
              href={`/patient-assistance/${campaign.slug ?? campaign.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[12px] text-white gradient-primary
                hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(21,101,216,0.28)] active:scale-95"
            >
              <Heart size={12} fill="currentColor" /> Donate Now
            </Link>
            <Link
              href={`/patient-assistance/${campaign.slug ?? campaign.id}`}
              className="px-3 py-2.5 rounded-xl font-bold text-[12px] border border-border text-text-secondary
                hover:border-primary hover:text-primary transition-all active:scale-95"
            >
              Story
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ─── Main page client component ───────────────────────────────────────────────
type Filter = 'all' | 'active' | 'completed'

interface Props {
  campaigns: Campaign[]
  settings:  any
}

export default function PatientAssistanceClient({ campaigns, settings }: Props) {
  const [filter, setFilter]   = useState<Filter>('all')
  const [search, setSearch]   = useState('')
  const [heroVis, setHeroVis] = useState(false)

  useEffect(() => {
    setHeroVis(true) // hero is above the fold, so it animates on mount
  }, [])

  const filtered = useMemo(() => {
    return campaigns.filter(c => {
      const matchFilter =
        filter === 'all'       ? true :
        filter === 'active'    ? c.status === 'active' || c.status === 'published' :
        filter === 'completed' ? c.status === 'completed' : true
      const q = search.toLowerCase().trim()
      const matchSearch = !q ||
        c.diagnosis?.toLowerCase().includes(q) ||
        c.treatmentRequired?.toLowerCase().includes(q) ||
        c.hospital?.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [campaigns, filter, search])

  const totalRaised = campaigns.reduce((s, c) => s + (c.amountRaised ?? 0), 0)
  const totalGoal   = campaigns.reduce((s, c) => s + (c.estimatedCost ?? 0), 0)
  const activeCount = campaigns.filter(c => c.status === 'active' || c.status === 'published').length

  return (
    <main className="min-h-screen bg-bg">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-border">
        <div className="container-max px-4 md:px-8 py-3">
          <ol className="flex items-center gap-1.5 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center gap-1.5">
              <Link href="/" itemProp="item" className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors text-xs font-medium">
                <Home size={12} /><span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li className="flex items-center"><ChevronRight size={12} className="text-border" /></li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center">
              <span itemProp="name" className="text-xs font-semibold text-navy">Patient Assistance</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-dark opacity-97" />

        {/* Animated dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        {/* ECG line decoration */}
        <svg className="absolute bottom-0 left-0 w-full opacity-15" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <polyline
            points="0,40 120,40 155,8 175,72 195,8 215,72 240,40 360,40 395,8 415,72 435,8 455,72 480,40 720,40 755,8 775,72 795,8 815,72 840,40 1080,40 1115,8 1135,72 1155,8 1175,72 1200,40 1440,40"
            fill="none" stroke="#18B8E6" strokeWidth="2"
          />
        </svg>

        {/* Floating hearts */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/5 select-none pointer-events-none"
            style={{
              fontSize: `${[48,32,64,40,56,36][i]}px`,
              left:     `${[8,22,42,60,75,88][i]}%`,
              top:      `${[15,55,20,70,30,50][i]}%`,
              animation: `float-heart ${[6,8,7,9,6.5,8.5][i]}s ease-in-out ${[0,1,2,0.5,1.5,0.8][i]}s infinite`,
            }}
          >
            ♥
          </div>
        ))}

        <div
          className="container-max px-4 md:px-8 relative z-10 text-center"
          style={{
            opacity:   heroVis ? 1 : 0,
            transform: heroVis ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-green text-[11px] font-bold uppercase tracking-widest mb-6">
            <HandHeart size={13} />
            Doctor-Verified Campaigns
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5 max-w-4xl mx-auto">
            Be the Reason Someone
            <span className="block mt-1" style={{ background: 'linear-gradient(90deg, #18B8E6, #18B55A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Gets a Second Chance
            </span>
          </h1>

          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Every patient below has been personally verified by our cardiologist.
            100% of your donation goes directly to their treatment.
          </p>

          {/* Live stats row */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { label: 'Campaigns',    value: campaigns.length, suffix: '+',      icon: Target    },
              { label: 'Active Now',   value: activeCount,      suffix: '',       icon: Sparkles  },
              { label: 'Total Raised', value: Math.round(totalRaised / 1000), prefix: '₹', suffix: 'K+', icon: TrendingUp },
              { label: 'Lives Helped', value: campaigns.filter(c => c.status === 'completed').length, suffix: '', icon: Users },
            ].map(({ label, value, prefix, suffix, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-1">
                  <Icon size={16} className="text-cyan" />
                </div>
                <span className="text-2xl md:text-3xl font-extrabold text-white">
                  <AnimCounter to={value} prefix={prefix ?? ''} suffix={suffix} />
                </span>
                <span className="text-white/50 text-[11px] font-semibold uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges strip ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="container-max px-4 md:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { icon: Shield,      text: 'Doctor-Verified',   sub: 'Every campaign is medically reviewed'   },
              { icon: TrendingUp,  text: '100% Transparent',  sub: 'Track exactly where donations go'        },
              { icon: CheckCircle, text: 'Secure Payments',   sub: 'Razorpay — PCI-DSS compliant'           },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/6 border border-primary/12 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-[12px] font-extrabold text-navy">{text}</p>
                  <p className="text-[11px] text-text-secondary">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter + Search bar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container-max px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-bg rounded-xl p-1 border border-border">
            {(['all', 'active', 'completed'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                {f === 'all' ? `All (${campaigns.length})` :
                 f === 'active' ? `Active (${campaigns.filter(c => c.status === 'active' || c.status === 'published').length})` :
                 `Completed (${campaigns.filter(c => c.status === 'completed').length})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by diagnosis, hospital…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 text-text-primary placeholder:text-text-secondary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-error">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Campaign grid ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container-max px-4 md:px-8">

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <Heart size={48} className="text-border mx-auto mb-4" />
              <h3 className="text-lg font-bold text-navy mb-2">No campaigns found</h3>
              <p className="text-text-secondary text-sm">Try adjusting your search or filter.</p>
              <button onClick={() => { setSearch(''); setFilter('all') }}
                className="mt-4 text-primary text-sm font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c, i) => (
                <CampaignCard key={c.id} campaign={c} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Overall funding progress ──────────────────────────────────────── */}
      {totalGoal > 0 && (
        <section className="py-12 bg-white border-t border-border">
          <div className="container-max px-4 md:px-8 max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Overall funding progress</p>
            <p className="text-3xl font-extrabold text-navy mb-1">
              ₹{totalRaised.toLocaleString('en-IN')} <span className="text-text-secondary font-semibold text-xl">raised of ₹{totalGoal.toLocaleString('en-IN')}</span>
            </p>
            <ProgressBar raised={totalRaised} goal={totalGoal} />
          </div>
        </section>
      )}

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container-max px-4 md:px-8 max-w-3xl mx-auto">
          <div className="rounded-3xl overflow-hidden gradient-dark p-10 text-center relative">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <Heart size={40} className="text-white/30 mx-auto mb-4" fill="currentColor" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Have a Patient to Nominate?
            </h2>
            <p className="text-white/70 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
              If you know a cardiac patient who needs financial assistance,
              contact us. Every case is reviewed by {settings?.doctorName ?? 'our specialist'} personally.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-green text-white hover:bg-green-light transition shadow-lg"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── How it works section ─────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Campaign Submitted',   body: 'Patient or family submits details with medical documents and consent form.' },
    { n: '02', title: 'Doctor Verification',  body: 'Our cardiologist reviews every case and approves only genuine patients.' },
    { n: '03', title: 'Campaign Goes Live',   body: 'Verified campaigns are published with full transparency on funding progress.' },
    { n: '04', title: 'You Donate',           body: 'Donate any amount securely via Razorpay. 100% goes to the patient.' },
    { n: '05', title: 'Treatment Begins',     body: 'Funds are disbursed directly to the hospital for the patient\'s treatment.' },
    { n: '06', title: 'Updates Shared',       body: 'Donors receive real-time campaign updates as treatment progresses.' },
  ]
  return (
    <section className="py-16 md:py-20 bg-bg border-t border-border">
      <div className="container-max px-4 md:px-8">
        <Reveal effect="fade-up" offset={0.1} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} /> How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight">
            Transparent from Start to Finish
          </h2>
          <p className="text-text-secondary mt-2 text-base max-w-xl mx-auto">
            Every rupee is tracked and every campaign is doctor-verified. Here&apos;s how your donation creates impact.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => <StepCard key={s.n} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}

// One card per step, each with its own reveal (keeps hooks out of the loop)
function StepCard({ s, i }: { s: { n: string; title: string; body: string }; i: number }) {
  return (
    <Reveal effect="pop-center" delay={i * 80} offset={0.1} className="h-full">
      <div className="h-full bg-white rounded-2xl border border-border p-6 hover:shadow-[0_8px_32px_rgba(21,101,216,0.10)] hover:border-primary/20 transition-all duration-300 group">
        <div className="text-3xl font-extrabold text-border group-hover:text-primary/20 transition-colors mb-3 font-mono">
          {s.n}
        </div>
        <h3 className="text-sm font-extrabold text-navy mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
        <p className="text-[12px] text-text-secondary leading-relaxed">{s.body}</p>
      </div>
    </Reveal>
  )
}
