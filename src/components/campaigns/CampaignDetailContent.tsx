'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Heart, Shield, ArrowRight, ArrowLeft, Calendar, Clock,
  CheckCircle, ChevronRight, Home, Share2, Facebook,
  Twitter, LinkIcon, TrendingUp, Users, MapPin,
  FileText, AlertCircle, X, Phone, Sparkles, IndianRupee,
} from 'lucide-react'
import type { Campaign } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'

// ─── Animated progress bar ────────────────────────────────────────────────────
function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const target = Math.min(Math.round((raised / Math.max(goal, 1)) * 100), 100)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const start = performance.now()
          const dur   = 1400
          const tick  = (now: number) => {
            const t    = Math.min((now - start) / dur, 1)
            const ease = 1 - Math.pow(1 - t, 3)
            setPct(Math.round(ease * target))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          obs.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return (
    <div ref={ref}>
      <div className="h-4 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width:      `${pct}%`,
            background: 'linear-gradient(90deg, #1565D8 0%, #18B8E6 50%, #18B55A 100%)',
            transition: 'box-shadow 0.3s',
            boxShadow:  pct > 0 ? '0 0 12px rgba(24,181,90,0.5)' : 'none',
          }}
        >
          {/* Shimmer on bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>
      <div className="flex justify-between items-center mt-1.5 text-xs font-semibold">
        <span className="text-green">₹{raised.toLocaleString('en-IN')} raised</span>
        <span className="text-text-secondary">{target}% funded</span>
      </div>
    </div>
  )
}

// ─── Donate amount button ─────────────────────────────────────────────────────
function AmountBtn({ amount, selected, onClick }: { amount: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
        selected
          ? 'border-primary bg-primary text-white shadow-md shadow-primary/30'
          : 'border-border text-navy hover:border-primary hover:text-primary bg-white'
      }`}
    >
      ₹{amount.toLocaleString('en-IN')}
    </button>
  )
}


// ─── Donation Success Modal ───────────────────────────────────────────────────
interface SuccessInfo {
  donorName:   string
  amount:      number
  paymentId:   string
  orderId:     string
  campaignName: string
}

function DonationSuccessModal({ info, onClose }: { info: SuccessInfo; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(10,20,50,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Sheet on mobile (slides up), centered card on sm+ */}
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Top gradient banner */}
        <div className="relative py-7 sm:py-10 px-5 sm:px-6 text-center overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg,#143B7D 0%,#1565D8 60%,#18B55A 100%)' }}>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

          {/* Close X button top-right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
            aria-label="Close"
          >
            <X size={14} className="text-white" />
          </button>

          {/* Animated check */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle size={32} className="text-white sm:hidden" />
            <CheckCircle size={40} className="text-white hidden sm:block" />
          </div>
          <div className="relative z-10">
            <p className="text-white/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">Payment Successful</p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Thank you, {info.donorName}!
            </h2>
            <p className="text-white/75 text-xs sm:text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              Your donation has been received and will go directly to {info.campaignName} patient&apos;s treatment.
            </p>
          </div>
        </div>

        {/* Scrollable payment details */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-3 sm:space-y-4">

          {/* Amount highlight */}
          <div className="flex items-center justify-center gap-2 py-3 sm:py-4 rounded-2xl bg-[#18B55A]/8 border border-[#18B55A]/20">
            <IndianRupee size={20} className="text-[#18B55A] shrink-0" />
            <span className="text-2xl sm:text-3xl font-extrabold text-[#143B7D]">
              {info.amount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs sm:text-sm text-[#6B7280] font-medium self-end pb-0.5">donated</span>
          </div>

          {/* Transaction details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2.5 px-3 sm:px-4 rounded-xl bg-[#F8FAFC] border border-[#DCE3EC]">
              <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wide shrink-0">Donor</span>
              <span className="text-xs sm:text-sm font-semibold text-[#1F2937] ml-3 text-right truncate max-w-[60%]">{info.donorName}</span>
            </div>
            <div className="flex items-start justify-between py-2.5 px-3 sm:px-4 rounded-xl bg-[#F8FAFC] border border-[#DCE3EC] gap-3">
              <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wide shrink-0 mt-0.5">Payment ID</span>
              <span className="text-[10px] sm:text-xs font-mono font-semibold text-[#1565D8] break-all text-right">{info.paymentId}</span>
            </div>
            <div className="flex items-start justify-between py-2.5 px-3 sm:px-4 rounded-xl bg-[#F8FAFC] border border-[#DCE3EC] gap-3">
              <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wide shrink-0 mt-0.5">Order ID</span>
              <span className="text-[10px] sm:text-xs font-mono font-semibold text-[#6B7280] break-all text-right">{info.orderId}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 px-3 sm:px-4 rounded-xl bg-[#F8FAFC] border border-[#DCE3EC]">
              <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wide shrink-0">Date</span>
              <span className="text-xs sm:text-sm font-semibold text-[#1F2937]">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Trust note */}
          <div className="flex items-start gap-2.5 p-3 sm:p-3.5 bg-[#18B55A]/6 border border-[#18B55A]/20 rounded-xl">
            <Shield size={13} className="text-[#18B55A] shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-[11px] text-[#18B55A] font-medium leading-relaxed">
              100% of your donation goes to the patient&apos;s treatment. You may receive a confirmation on your registered contact.
            </p>
          </div>

          {/* Close / Done button — reloads page to refresh donation stats */}
          <button
            onClick={onClose}
            className="w-full py-3 sm:py-3.5 rounded-xl font-extrabold text-white text-sm transition hover:opacity-90 active:scale-[0.98] shadow-lg"
            style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Donate box ────────────────────────────────────────────────────────────────
function DonateBox({ campaign }: { campaign: Campaign }) {
  const router   = useRouter()
  const presets  = [500, 1000, 2000, 5000]
  const [amount,    setAmount]    = useState(1000)
  const [custom,    setCustom]    = useState('')
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [anonymous,    setAnonymous]    = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [successInfo,  setSuccessInfo]  = useState<SuccessInfo | null>(null)

  const handleModalClose = useCallback(() => {
    setSuccessInfo(null)
    router.refresh()   // re-fetch server component data so amountRaised updates
  }, [router])

  const finalAmount = custom ? parseInt(custom) || 0 : amount

  const handleDonate = async () => {
    setError('')
    if (finalAmount < 1) { setError('Please enter a valid amount.'); return }
    if (!anonymous && !name.trim()) { setError('Please enter your name.'); return }
    if (!anonymous && !phone.trim()) { setError('Please enter your phone number.'); return }
    if (!anonymous && !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.'); return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/razorpay/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          amount:      finalAmount,
          campaignId:  campaign.id,
          campaignName: campaign.diagnosis,
          donorName:   anonymous ? 'Anonymous' : name.trim(),
          donorPhone:  anonymous ? '' : phone.trim(),
        }),
      })
      const data = await res.json()
      if (!data.orderId) throw new Error(data.error ?? 'No order ID')

      const rzp = new (window as any).Razorpay({
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      data.amount,
        currency:    data.currency ?? 'INR',
        order_id:    data.orderId,
        name:        'UpBeat Heart',
        description: `Donation for ${campaign.diagnosis} patient`,
        prefill: {
          name:    anonymous ? '' : name.trim(),
          contact: anonymous ? '' : phone.trim(),
        },
        theme: { color: '#1565D8' },
        handler: async (resp: any) => {
          // Verify + save donation server-side. Only show the success screen
          // AFTER the server confirms the payment was recorded.
          try {
            const res = await fetch('/api/razorpay/verify', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                razorpay_order_id:   resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature:  resp.razorpay_signature,
                campaignId:          campaign.id,
                campaignName:        campaign.diagnosis,
                donorName:           anonymous ? 'Anonymous' : name.trim(),
                donorPhone:          anonymous ? '' : phone.trim(),
                amount:              finalAmount,
                anonymous,
              }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
              setError(data.error ?? 'Payment received but could not be verified. Our team will contact you shortly.')
              return
            }
          } catch (e) {
            console.error('Verify error:', e)
            setError('Payment received but could not be verified. Our team will contact you shortly.')
            return
          }
          setSuccessInfo({
            donorName:    anonymous ? 'Anonymous Donor' : name.trim() || 'Donor',
            amount:       finalAmount,
            paymentId:    resp.razorpay_payment_id,
            orderId:      resp.razorpay_order_id,
            campaignName: campaign.diagnosis ?? campaign.patientName ?? 'Patient',
          })
          setLoading(false)
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
      rzp.open()
    } catch (err: any) {
      setError(err?.message ?? 'Payment setup failed. Please try again.')
      setLoading(false)
    }
  }

  const pct = Math.min(Math.round(((campaign.amountRaised ?? 0) / Math.max(campaign.estimatedCost ?? 1, 1)) * 100), 100)

  return (
    <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden sticky top-24">
      {/* Header */}
      <div className="gradient-dark p-5 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <Heart size={24} className="mx-auto mb-2 text-white/70" fill="currentColor" />
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Make a Difference</p>
        <p className="text-xl font-extrabold">Donate Now</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Progress */}
        <ProgressBar raised={campaign.amountRaised ?? 0} goal={campaign.estimatedCost ?? 1} />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg rounded-xl p-3 text-center border border-border">
            <p className="text-xs text-text-secondary font-medium mb-0.5">Goal</p>
            <p className="text-sm font-extrabold text-navy">₹{(campaign.estimatedCost ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-bg rounded-xl p-3 text-center border border-border">
            <p className="text-xs text-text-secondary font-medium mb-0.5">Remaining</p>
            <p className="text-sm font-extrabold text-primary">
              ₹{Math.max(0, (campaign.estimatedCost ?? 0) - (campaign.amountRaised ?? 0)).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Amount presets */}
        <div>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Choose Amount</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <AmountBtn key={p} amount={p} selected={!custom && amount === p} onClick={() => { setAmount(p); setCustom('') }} />
            ))}
          </div>
        </div>

        {/* Custom */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm">₹</span>
          <input
            type="number"
            placeholder="Custom amount"
            value={custom}
            onChange={e => { setCustom(e.target.value); setAmount(0) }}
            className="w-full pl-8 pr-4 py-3 border-2 border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary text-navy placeholder:text-text-secondary"
          />
        </div>

        {/* Donor details */}
        {!anonymous && (
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Your Details</p>
            <input
              type="text"
              placeholder="Full Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-navy placeholder:text-text-secondary"
            />
            <input
              type="tel"
              placeholder="Mobile Number * (10 digits)"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary text-navy placeholder:text-text-secondary"
            />
          </div>
        )}

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setAnonymous(v => !v)}
            className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${anonymous ? 'bg-primary' : 'bg-border'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${anonymous ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-xs text-text-secondary font-medium">Donate anonymously</span>
        </label>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Donate CTA */}
        <button
          onClick={handleDonate}
          disabled={loading || finalAmount < 1 || pct >= 100}
          className="w-full py-4 rounded-xl font-extrabold text-white text-sm gradient-primary
            hover:opacity-90 transition-all shadow-[0_6px_20px_rgba(21,101,216,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? 'Processing…' : pct >= 100 ? 'Fully Funded ✓' : `Donate ₹${finalAmount.toLocaleString('en-IN')}`}
        </button>

        {pct >= 100 && (
          <p className="text-center text-xs text-green font-semibold">🎉 This campaign is fully funded. Thank you!</p>
        )}

        {/* Trust note */}
        <div className="flex items-start gap-2 p-3 bg-green/6 border border-green/20 rounded-xl">
          <Shield size={13} className="text-green shrink-0 mt-0.5" />
          <p className="text-[11px] text-green font-medium leading-relaxed">
            Doctor-verified. 100% of your donation goes to the patient&apos;s treatment at {campaign.hospital || 'the hospital'}.
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {successInfo && (
        <DonationSuccessModal
          info={successInfo}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

// ─── Updates timeline ──────────────────────────────────────────────────────────
function UpdatesTimeline({ updates }: { updates: { text: string; date: string }[] }) {
  if (!updates?.length) return null
  return (
    <div className="space-y-4">
      {updates.map((u, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary mt-1 shrink-0" />
            {i < updates.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-xs text-text-secondary font-medium mb-1">{u.date}</p>
            <p className="text-sm text-text-primary leading-relaxed">{u.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Related campaign card ────────────────────────────────────────────────────
function RelatedCard({ c }: { c: Campaign }) {
  const firstName = c.patientName?.split(' ')[0] ?? 'Patient'
  const pct = Math.min(Math.round(((c.amountRaised ?? 0) / Math.max(c.estimatedCost ?? 1, 1)) * 100), 100)
  return (
    <Link href={`/patient-assistance/${c.slug ?? c.id}`}
      className="flex items-center gap-3 p-4 hover:bg-bg transition group border-b border-border last:border-0">
      <div className="relative w-14 h-12 rounded-xl overflow-hidden shrink-0 bg-bg border border-border">
        {c.photos?.[0]
          ? <LazyImage src={c.photos[0]} alt={firstName} revealBlur revealScale className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full gradient-primary opacity-50 flex items-center justify-center">
              <Heart size={16} className="text-white/50" fill="currentColor" />
            </div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-navy group-hover:text-primary transition-colors truncate">{firstName} — {c.diagnosis}</p>
        <div className="mt-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-text-secondary mt-0.5">{pct}% funded</p>
      </div>
    </Link>
  )
}

// ─── Main detail page ─────────────────────────────────────────────────────────
interface Props {
  campaign: Campaign
  settings: any
  related:  Campaign[]
}

export default function CampaignDetailContent({ campaign, settings, related }: Props) {
  const [mounted, setMounted] = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  const firstName  = campaign.patientName?.split(' ')[0] ?? 'Patient'
  const shareUrl   = typeof window !== 'undefined' ? window.location.href : `https://upbeatheart.com/patient-assistance/${campaign.slug ?? campaign.id}`
  const photos     = campaign.photos ?? []

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="min-h-screen bg-bg">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-border">
        <div className="container-max px-4 md:px-8 py-3">
          <ol className="flex items-center gap-1.5 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center gap-1.5">
              <Link href="/" itemProp="item" className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors text-xs font-medium">
                <Home size={12} /><span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li><ChevronRight size={12} className="text-border" /></li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center gap-1.5">
              <Link href="/patient-assistance" itemProp="item" className="text-text-secondary hover:text-primary transition-colors text-xs font-medium">
                <span itemProp="name">Patient Assistance</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li><ChevronRight size={12} className="text-border" /></li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center">
              <span itemProp="name" className="text-xs font-semibold text-navy truncate max-w-[160px] md:max-w-xs">
                {firstName} — {campaign.diagnosis}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <div className="relative bg-navy overflow-hidden">
        {photos[activePhoto] ? (
          <div className="relative w-full h-[50vh] min-h-[280px] max-h-[480px] overflow-hidden">
            <LazyImage
              src={photos[activePhoto]}
              alt={`${firstName}'s campaign`}
              revealBlur
              rootMargin="0px"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              style={{ transition: 'opacity 0.4s' }}
            />
          </div>
        ) : (
          <div className="w-full h-[50vh] min-h-[280px] max-h-[480px] gradient-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10">
          <div className="container-max px-4 md:px-8 max-w-5xl"
            style={{
              opacity:   mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
            }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.doctorVerified && (
                <span className="flex items-center gap-1.5 bg-green text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                  <Shield size={10} /> Doctor Verified
                </span>
              )}
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg ${
                campaign.status === 'active'    ? 'bg-primary text-white' :
                campaign.status === 'completed' ? 'bg-navy/80 text-white border border-white/20' :
                'bg-white/20 text-white'
              }`}>
                {campaign.status === 'active' ? '🟢 Active Campaign' : campaign.status === 'completed' ? '✓ Fully Funded' : 'Open'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3">
              Help {firstName} fight {campaign.diagnosis}
            </h1>
            {campaign.hospital && (
              <p className="flex items-center gap-1.5 text-white/60 text-sm font-medium">
                <MapPin size={13} /> {campaign.hospital}
              </p>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="absolute top-5 left-0 right-0 z-10">
          <div className="container-max px-4 md:px-8">
            <Link href="/patient-assistance" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold transition">
              <ArrowLeft size={15} /> All Campaigns
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main content grid ─────────────────────────────────────────────── */}
      <div className="container-max px-4 md:px-8 py-10 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="space-y-8">

            {/* Photo gallery */}
            {photos.length > 0 && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-navy aspect-video">
                  <LazyImage
                    src={photos[activePhoto]}
                    alt={`${firstName} photo ${activePhoto + 1}`}
                    revealBlur
                    rootMargin="0px"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transition: 'opacity 0.3s' }}
                  />
                  {photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-navy/70 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                      {activePhoto + 1} / {photos.length}
                    </div>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((p, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-12 rounded-lg shrink-0 cursor-pointer overflow-hidden"
                        onClick={() => setActivePhoto(i)}
                      >
                        <LazyImage
                          src={p}
                          alt=""
                          rootMargin="0px"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Diagnosis',  value: campaign.diagnosis,                   icon: AlertCircle },
                { label: 'Treatment',  value: campaign.treatmentRequired,            icon: FileText    },
                { label: 'Hospital',   value: campaign.hospital || 'Not specified',  icon: MapPin      },
                { label: 'Consent',    value: campaign.consentSigned ? 'Signed ✓' : 'Pending', icon: CheckCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-xl border border-border p-4 text-center">
                  <Icon size={16} className="text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-xs font-bold text-navy leading-tight">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Patient story */}
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Heart size={16} className="text-primary" fill="currentColor" />
                <h2 className="text-base font-extrabold text-navy">{firstName}&apos;s Story</h2>
              </div>
              {campaign.patientStory ? (
                <div
                  className="text-sm text-text-primary leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{
                    __html: campaign.patientStory.includes('<')
                      ? campaign.patientStory
                      : campaign.patientStory.split('\n').map(p => `<p>${p}</p>`).join('')
                  }}
                />
              ) : (
                <p className="text-sm text-text-secondary italic">Story coming soon.</p>
              )}
            </div>

            {/* Campaign updates */}
            {(campaign.updates?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={16} className="text-primary" />
                  <h2 className="text-base font-extrabold text-navy">Campaign Updates</h2>
                  <span className="ml-auto text-[10px] font-bold bg-primary/8 text-primary border border-primary/15 px-2 py-0.5 rounded-full">
                    {campaign.updates!.length} update{campaign.updates!.length > 1 ? 's' : ''}
                  </span>
                </div>
                <UpdatesTimeline updates={campaign.updates ?? []} />
              </div>
            )}

            {/* Share section */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Share this campaign</p>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold hover:opacity-90 transition"
                >
                  <Facebook size={13} /> Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Help ${firstName} fight ${campaign.diagnosis} — donate now!`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2] text-white text-xs font-bold hover:opacity-90 transition"
                >
                  <Twitter size={13} /> Twitter
                </a>
                {settings?.whatsapp && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Help ${firstName} fight ${campaign.diagnosis}. Donate here: ${shareUrl}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green text-white text-xs font-bold hover:opacity-90 transition"
                  >
                    <Share2 size={13} /> WhatsApp
                  </a>
                )}
                <button
                  onClick={copyLink}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    copied ? 'bg-green/10 border border-green/30 text-green' : 'bg-bg border border-border text-text-secondary hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {copied ? <CheckCircle size={13} /> : <LinkIcon size={13} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-5">
            {/* Donate box */}
            <DonateBox campaign={campaign} />

            {/* Doctor verified card */}
            {campaign.doctorVerified && settings?.doctorName && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  {settings.doctorPhotoUrl ? (
                    <div className="relative w-11 h-11 rounded-full shrink-0 overflow-hidden border-2 border-primary/20">
                      <LazyImage
                        src={settings.doctorPhotoUrl}
                        alt={settings.doctorName}
                        revealBlur
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                      {settings.doctorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-navy">{settings.doctorName}</p>
                    <p className="text-[11px] text-text-secondary">{settings.doctorTitle ?? 'Cardiologist'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-green/6 border border-green/20 rounded-xl">
                  <Shield size={12} className="text-green shrink-0 mt-0.5" />
                  <p className="text-[11px] text-green font-medium leading-relaxed">
                    I have personally reviewed this patient&apos;s case and verified their need for financial assistance.
                  </p>
                </div>
              </div>
            )}

            {/* Related campaigns */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
                    <Users size={14} className="text-primary" /> Other Campaigns
                  </h3>
                </div>
                <div>
                  {related.map(c => <RelatedCard key={c.id} c={c} />)}
                </div>
                <div className="p-4 border-t border-border">
                  <Link href="/patient-assistance"
                    className="flex items-center justify-center gap-1.5 text-primary text-xs font-bold hover:underline">
                    View all campaigns <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </main>
  )
}
