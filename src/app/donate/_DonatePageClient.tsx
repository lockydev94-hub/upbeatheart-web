/**
 * _DonatePageClient — advanced donate page
 *
 * Layout:
 *   LEFT (2/3)  — payment method cards (Razorpay, UPI, Bank, Cheque)
 *                 each with collapsible "Notify Us" form
 *   RIGHT (1/3) — sticky sidebar:
 *                   • Why Donate impact amounts
 *                   • Our Generous Donors (last 15, flat list)
 *                   • Contact card
 *
 * UX changes:
 *   - Notify Us form is collapsed by default; clicking the section header
 *     OR the "Notify Us" toggle button expands it with smooth animation
 *   - Razorpay: order-based flow with name + phone required before opening
 */
'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/firebase-client'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import {
  Heart, Smartphone, Building2, FileText, CreditCard,
  Copy, Check, ChevronDown, ChevronUp, IndianRupee,
  ArrowLeft, ExternalLink, AlertCircle, Send, CheckCircle2,
  Users, Phone, Mail, Sparkles,
} from 'lucide-react'
import type { SiteSettings } from '@/types/firestore'
import type { PublicDonor } from '@/lib/firestore/donations'

interface Props {
  settings: SiteSettings
  donors:   PublicDonor[]
}

/* ─── tiny helpers ──────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1565D8]/8 text-[#1565D8] hover:bg-[#1565D8]/15 text-xs font-semibold transition-colors shrink-0"
    >
      {copied ? <Check size={11}/> : <Copy size={11}/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function DetailRow({ label, value, mono = false, copyable = false }: {
  label: string; value: string; mono?: boolean; copyable?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 gap-2">
      <span className="text-xs text-gray-400 shrink-0 w-28">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 flex-1 min-w-0 mr-1 truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
      {copyable && <CopyBtn text={value} />}
    </div>
  )
}

/* ─── collapsible Notify form ───────────────────────────────── */
function NotifyForm({
  method, txnPlaceholder, expanded, onToggle,
}: {
  method: 'upi' | 'bank_transfer' | 'cheque'
  txnPlaceholder: string
  expanded: boolean
  onToggle: () => void
}) {
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [amount,  setAmount]  = useState('')
  const [txnRef,  setTxnRef]  = useState('')
  const [anon,    setAnon]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')
  const [done,    setDone]    = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  // smooth height transition
  useEffect(() => {
    if (!bodyRef.current) return
    if (expanded) {
      bodyRef.current.style.maxHeight = bodyRef.current.scrollHeight + 'px'
    } else {
      bodyRef.current.style.maxHeight = '0px'
    }
  }, [expanded, done])

  const handleSubmit = async () => {
    setErr('')
    if (!anon && !name.trim()) { setErr('Please enter your name or tick anonymous'); return }
    if (!phone.trim())         { setErr('Contact number is required for receipt'); return }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 1) { setErr('Enter a valid amount'); return }
    setLoading(true)
    try {
      const payload: Record<string, any> = {
        campaignId: '', campaignName: '',
        donorName:  anon ? 'Anonymous' : name.trim(),
        donorPhone: phone.trim(),
        donorEmail: null,
        amount:     Number(amount),
        paymentMethod: method,
        source:     'online',
        status:     'created',
        anonymous:  anon,
        showOnWebsite:    false,
        showAmountPublic: false,
        notes: `Self-reported via website. Txn ref: ${txnRef.trim() || 'not provided'}`,
        createdAt:  serverTimestamp(),
        updatedAt:  serverTimestamp(),
      }
      if (method === 'upi')          payload.upiTransactionId = txnRef.trim() || null
      if (method === 'cheque')       payload.chequeNumber     = txnRef.trim() || null
      if (method === 'bank_transfer') payload.upiTransactionId = txnRef.trim() || null
      await addDoc(collection(db, 'donations'), payload)
      setDone(true)
      if (bodyRef.current) bodyRef.current.style.maxHeight = bodyRef.current.scrollHeight + 'px'
    } catch (e: any) {
      setErr('Could not submit. Please try again or contact us.')
    } finally { setLoading(false) }
  }

  return (
    <div className="mt-5 border-t border-gray-100 pt-1">
      {/* toggle button */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mt-3 text-sm font-semibold transition-colors ${
          expanded
            ? 'bg-[#1565D8] text-white'
            : 'bg-[#1565D8]/6 text-[#1565D8] hover:bg-[#1565D8]/12'
        }`}
      >
        <span className="flex items-center gap-2">
          <Send size={14}/>
          Notify Us After Transfer
        </span>
        {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
      </button>

      {/* collapsible body */}
      <div
        ref={bodyRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: '0px' }}
      >
        <div className="pt-4 pb-1 space-y-3">
          {done ? (
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-bold text-green-800">Received! Thank you.</p>
                <p className="text-xs text-green-700 mt-0.5">Our team will verify and send a receipt to your number shortly.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">Fill this so we can record your donation and issue a receipt.</p>

              {/* anon toggle */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">Your Details</p>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} className="rounded accent-[#1565D8]"/>
                  <span className="text-xs text-gray-500">Anonymous</span>
                </label>
              </div>

              {!anon && (
                <input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>
              )}
              <input placeholder="Contact Number * (for receipt)" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>

              <div className="relative">
                <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="number" placeholder="Amount transferred (₹) *" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>
              </div>

              <input placeholder={txnPlaceholder} value={txnRef} onChange={e => setTxnRef(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>

              {err && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={13} className="shrink-0 mt-0.5"/> {err}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-2.5 bg-[#1565D8] text-white rounded-xl font-bold text-sm hover:bg-[#143B7D] disabled:opacity-60 transition flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting…</>
                  : <><Send size={13}/> Submit Notification</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Razorpay widget ───────────────────────────────────────── */
const AMOUNTS = [100, 250, 500, 1000, 2500, 5000]

function RazorpayWidget({ settings }: { settings: SiteSettings }) {
  const [amount,  setAmount]  = useState(500)
  const [custom,  setCustom]  = useState('')
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [anon,    setAnon]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')
  const [success, setSuccess] = useState(false)

  const finalAmount = custom ? Number(custom) : amount

  const handlePay = async () => {
    setErr('')
    if (finalAmount < 10)          { setErr('Minimum donation is ₹10'); return }
    if (!anon && !name.trim())     { setErr('Please enter your name or tick anonymous'); return }
    if (!phone.trim())             { setErr('Contact number is required'); return }
    setLoading(true)
    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, campaignId: '', campaignName: '',
          donorName: anon ? 'Anonymous' : name.trim(), donorPhone: phone.trim(),
          donorEmail: email.trim() || '', anonymous: anon }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok || !order.orderId) {
        setErr(order.error || 'Failed to initiate payment.'); setLoading(false); return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          key: settings.razorpayKeyId,
          amount: order.amount, currency: order.currency, order_id: order.orderId,
          name: settings.upiName || 'UpBeat Heart',
          description: 'General Donation — UpBeat Heart',
          prefill: { name: anon ? '' : name.trim(), email: email.trim(), contact: phone.trim() },
          theme: { color: '#1565D8' },
          handler: async (response: any) => {
            try {
              const vr = await fetch('/api/razorpay/verify', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  campaignId: '', campaignName: '',
                  donorName: name.trim(), donorPhone: phone.trim(),
                  donorEmail: email.trim() || '', amount: finalAmount, anonymous: anon,
                }),
              })
              const vd = await vr.json()
              if (vr.ok && vd.success) setSuccess(true)
              else setErr('Payment received but verification failed. Contact us with payment ID: ' + response.razorpay_payment_id)
            } catch { setErr('Verification error. Contact us with payment ID: ' + response.razorpay_payment_id) }
            setLoading(false)
          },
          modal: { ondismiss: () => setLoading(false) },
        })
        rzp.on('payment.failed', (r: any) => { setErr(r.error?.description || 'Payment failed.'); setLoading(false) })
        rzp.open()
      }
      script.onerror = () => { setErr('Could not load payment gateway. Please try another method.'); setLoading(false) }
      document.body.appendChild(script)
    } catch { setErr('Something went wrong. Please try again.'); setLoading(false) }
  }

  if (success) return (
    <div className="flex flex-col items-center py-8 text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-green-600"/>
      </div>
      <h3 className="text-lg font-bold text-gray-900">Thank you for your donation!</h3>
      <p className="text-sm text-gray-500 max-w-xs">₹{finalAmount.toLocaleString('en-IN')} received. Receipt will be shared on your contact number shortly.</p>
      <button onClick={() => { setSuccess(false); setName(''); setPhone(''); setEmail(''); setCustom(''); setAmount(500) }}
        className="mt-1 text-sm text-[#1565D8] font-semibold hover:underline">Make another donation</button>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* amount */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Choose Amount</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {AMOUNTS.map(a => (
            <button key={a} onClick={() => { setAmount(a); setCustom('') }}
              className={`py-2 rounded-xl text-sm font-bold border-2 transition ${
                amount === a && !custom ? 'border-[#1565D8] bg-[#1565D8] text-white' : 'border-gray-200 text-gray-600 hover:border-[#1565D8]/40'
              }`}>₹{a >= 1000 ? `${a/1000}k` : a}</button>
          ))}
        </div>
        <div className="mt-2 relative">
          <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="number" placeholder="Custom amount…" value={custom}
            onChange={e => { setCustom(e.target.value); setAmount(0) }}
            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>
        </div>
      </div>

      {/* donor info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">Your Details</p>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} className="rounded accent-[#1565D8]"/>
            <span className="text-xs text-gray-500">Anonymous</span>
          </label>
        </div>
        {!anon && (
          <input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>
        )}
        <input placeholder="Contact Number *" value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>
        <input placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565D8]/25"/>
      </div>

      {err && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={14}/> {err}
        </div>
      )}

      <button onClick={handlePay} disabled={loading}
        className="w-full py-3.5 bg-[#1565D8] text-white rounded-2xl font-bold text-base hover:bg-[#143B7D] disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-md shadow-[#1565D8]/20">
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Processing…</>
          : <><CreditCard size={18}/> Donate ₹{finalAmount.toLocaleString('en-IN')} Securely</>
        }
      </button>
      <p className="text-center text-xs text-gray-400">Powered by Razorpay · 256-bit SSL encryption</p>
    </div>
  )
}

/* ─── Donor sidebar card ────────────────────────────────────── */
function DonorSidebar({ donors }: { donors: PublicDonor[] }) {
  function initials(name: string) {
    if (name === 'Anonymous') return '?'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }
  function timeAgo(iso: string) {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30)  return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(months / 12)}y ago`
  }

  // palette of subtle bg/text combos for avatars
  const COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-indigo-100 text-indigo-700',
  ]

  if (donors.length === 0) return (
    <div className="text-center py-8 px-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <Users size={20} className="text-gray-300"/>
      </div>
      <p className="text-sm font-medium text-gray-400">No public donors yet</p>
      <p className="text-xs text-gray-300 mt-1">Be the first to appear here!</p>
    </div>
  )

  return (
    <div className="space-y-1">
      {donors.map((d, i) => {
        const color = COLORS[i % COLORS.length]
        return (
          <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition group">
            {/* avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
              {initials(d.donorName)}
            </div>
            {/* info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{d.donorName}</p>
              {d.amount
                ? <p className="text-xs text-[#1565D8] font-bold">₹{d.amount.toLocaleString('en-IN')}</p>
                : <p className="text-xs text-gray-400">{d.monthLabel}</p>
              }
            </div>
            {/* time */}
            <span className="text-[10px] text-gray-300 shrink-0 group-hover:text-gray-400 transition">
              {timeAgo(d.createdAt)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function DonatePageClient({ settings, donors }: Props) {
  const hasRazorpay = !!settings.razorpayKeyId
  const hasUpi      = !!settings.upiId
  const hasBank     = !!settings.bankAccountNumber
  const hasCheque   = !!settings.chequePayableTo

  // which notify form is expanded
  const [notifyOpen, setNotifyOpen] = useState<'upi' | 'bank_transfer' | 'cheque' | null>(null)

  const upiLink = settings.upiId
    ? `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiName || '')}&cu=INR`
    : null

  const toggleNotify = (method: 'upi' | 'bank_transfer' | 'cheque') =>
    setNotifyOpen(prev => prev === method ? null : method)

  return (
    <main className="min-h-screen bg-[#F8FAFC]">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#143B7D] via-[#1565D8] to-[#18B8E6] py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={14}/> Back to home
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-5 border border-white/20">
            <Heart size={28} className="text-white fill-white/50"/>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Donate to Save a Heart
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
            Your contribution directly funds cardiac treatment for patients who cannot afford care.
            Every rupee matters.
          </p>
          {/* quick stats */}
          {donors.length > 0 && (
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-5 py-2">
              <Heart size={14} className="text-[#18B55A] fill-[#18B55A]"/>
              <span className="text-white/90 text-sm font-medium">
                {donors.length}+ generous donors have supported us
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT — payment methods (2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Razorpay */}
            {hasRazorpay && (
              <div id="online" className="scroll-mt-24 bg-white rounded-2xl border border-[#DCE3EC] shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-6 pb-5 border-b border-gray-50">
                  <div className="w-11 h-11 rounded-xl bg-[#1565D8]/8 flex items-center justify-center shrink-0">
                    <CreditCard size={20} className="text-[#1565D8]"/>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Pay Online</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Card · Net Banking · UPI · Wallets — instant confirmation</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    INSTANT
                  </span>
                </div>
                <div className="p-6 pt-5">
                  <RazorpayWidget settings={settings}/>
                </div>
              </div>
            )}

            {/* UPI */}
            {hasUpi && (
              <div id="upi" className="scroll-mt-24 bg-white rounded-2xl border border-[#DCE3EC] shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleNotify('upi')}
                  className="w-full flex items-center gap-4 p-6 pb-5 border-b border-gray-50 text-left hover:bg-gray-50/50 transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Smartphone size={20} className="text-purple-600"/>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">UPI Transfer</h2>
                    <p className="text-xs text-gray-400 mt-0.5">PhonePe · GPay · Paytm · BHIM — scan or copy ID</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    notifyOpen === 'upi' ? 'bg-[#1565D8] text-white' : 'bg-[#1565D8]/8 text-[#1565D8]'
                  }`}>
                    {notifyOpen === 'upi' ? 'Notifying ↑' : 'Notify Us ↓'}
                  </span>
                </button>
                <div className="p-6 pt-5">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* QR */}
                    <div className="shrink-0">
                      {settings.upiQrUrl ? (
                        <Image src={settings.upiQrUrl} alt="UPI QR" width={144} height={144} className="w-36 h-36 rounded-xl border-2 border-[#1565D8]/15 object-contain bg-white"/>
                      ) : (
                        <div className="w-36 h-36 rounded-xl border-2 border-dashed border-[#1565D8]/20 flex items-center justify-center bg-[#1565D8]/3">
                          <Smartphone size={24} className="text-[#1565D8]/30"/>
                        </div>
                      )}
                      {upiLink && (
                        <a href={upiLink} className="mt-2 flex items-center justify-center gap-1 text-xs text-[#1565D8] font-semibold hover:underline">
                          <ExternalLink size={10}/> Open UPI app
                        </a>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 px-4 py-1">
                      <DetailRow label="UPI ID" value={settings.upiId} mono copyable/>
                      {settings.upiName && <DetailRow label="Name" value={settings.upiName}/>}
                    </div>
                  </div>
                  <NotifyForm
                    method="upi"
                    txnPlaceholder="UPI Transaction ID (e.g. 325609XXXXXXX)"
                    expanded={notifyOpen === 'upi'}
                    onToggle={() => toggleNotify('upi')}
                  />
                </div>
              </div>
            )}

            {/* Bank Transfer */}
            {hasBank && (
              <div id="bank" className="scroll-mt-24 bg-white rounded-2xl border border-[#DCE3EC] shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleNotify('bank_transfer')}
                  className="w-full flex items-center gap-4 p-6 pb-5 border-b border-gray-50 text-left hover:bg-gray-50/50 transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-teal-600"/>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">Bank Transfer</h2>
                    <p className="text-xs text-gray-400 mt-0.5">NEFT · RTGS · IMPS — use the account details below</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    notifyOpen === 'bank_transfer' ? 'bg-[#1565D8] text-white' : 'bg-[#1565D8]/8 text-[#1565D8]'
                  }`}>
                    {notifyOpen === 'bank_transfer' ? 'Notifying ↑' : 'Notify Us ↓'}
                  </span>
                </button>
                <div className="p-6 pt-5">
                  <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-1">
                    <DetailRow label="Account Name"   value={settings.bankAccountName} copyable/>
                    <DetailRow label="Account Number" value={settings.bankAccountNumber} mono copyable/>
                    <DetailRow label="IFSC Code"      value={settings.bankIfsc} mono copyable/>
                    {settings.bankName   && <DetailRow label="Bank"   value={settings.bankName}/>}
                    {settings.bankBranch && <DetailRow label="Branch" value={settings.bankBranch}/>}
                  </div>
                  <NotifyForm
                    method="bank_transfer"
                    txnPlaceholder="UTR / Reference Number (e.g. HDFC00012345678)"
                    expanded={notifyOpen === 'bank_transfer'}
                    onToggle={() => toggleNotify('bank_transfer')}
                  />
                </div>
              </div>
            )}

            {/* Cheque / DD */}
            {hasCheque && (
              <div id="cheque" className="scroll-mt-24 bg-white rounded-2xl border border-[#DCE3EC] shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleNotify('cheque')}
                  className="w-full flex items-center gap-4 p-6 pb-5 border-b border-gray-50 text-left hover:bg-gray-50/50 transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-orange-500"/>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">Cheque / Demand Draft</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Draw in favour of the name below and courier to us</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    notifyOpen === 'cheque' ? 'bg-[#1565D8] text-white' : 'bg-[#1565D8]/8 text-[#1565D8]'
                  }`}>
                    {notifyOpen === 'cheque' ? 'Notifying ↑' : 'Notify Us ↓'}
                  </span>
                </button>
                <div className="p-6 pt-5">
                  <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-1">
                    <DetailRow label="Pay To"  value={settings.chequePayableTo} copyable/>
                    {settings.address && <DetailRow label="Send To" value={settings.address}/>}
                  </div>
                  <p className="mt-3 text-xs text-gray-400">Write your name and phone on the back of the cheque before dispatch.</p>
                  <NotifyForm
                    method="cheque"
                    txnPlaceholder="Cheque Number (e.g. 012345)"
                    expanded={notifyOpen === 'cheque'}
                    onToggle={() => toggleNotify('cheque')}
                  />
                </div>
              </div>
            )}

            {/* no methods */}
            {!hasRazorpay && !hasUpi && !hasBank && !hasCheque && (
              <div className="bg-white rounded-2xl border border-[#DCE3EC] shadow-sm p-10 text-center">
                <Heart size={40} className="mx-auto mb-4 text-gray-200"/>
                <p className="text-gray-500 font-medium">Donation methods are being set up</p>
                <p className="text-gray-400 text-sm mt-1">Please check back shortly or contact us directly.</p>
              </div>
            )}

            {settings.donationNote && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-700">
                <p className="font-semibold mb-0.5">Note</p>
                <p>{settings.donationNote}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT — sticky sidebar ── */}
          <div className="space-y-5 lg:sticky lg:top-24">

            {/* Impact amounts */}
            <div className="bg-white rounded-2xl border border-[#DCE3EC] shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-[#F59E0B]"/> Why Your Donation Matters
              </h3>
              <div className="space-y-3">
                {[
                  ['₹500',    'covers an ECG for a patient who cannot afford one'],
                  ['₹1,000',  'pays for a month of cardiac medication'],
                  ['₹5,000',  'funds a diagnostic echocardiogram'],
                  ['₹25,000', "supports a patient's surgery preparation"],
                ].map(([amt, desc]) => (
                  <div key={amt} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-[#1565D8] bg-[#1565D8]/8 px-2 py-1 rounded-lg shrink-0 mt-0.5 whitespace-nowrap">{amt}</span>
                    <span className="text-xs text-gray-500 leading-relaxed">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generous Donors — sidebar */}
            <div className="bg-white rounded-2xl border border-[#DCE3EC] shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <Heart size={14} className="text-red-500 fill-red-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">Our Generous Donors</h3>
                  <p className="text-[10px] text-gray-400">Last {Math.min(donors.length, 15)} supporters</p>
                </div>
                {donors.length > 0 && (
                  <span className="text-[10px] font-bold text-[#18B55A] bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    {donors.length} donors
                  </span>
                )}
              </div>
              <div className="py-2">
                <DonorSidebar donors={donors}/>
              </div>
              {donors.length >= 15 && (
                <div className="px-5 py-3 border-t border-gray-50 text-center">
                  <p className="text-xs text-gray-400">Showing last 15 donors</p>
                </div>
              )}
            </div>

            {/* Contact */}
            {(settings.phone || settings.email) && (
              <div className="bg-gradient-to-br from-[#1565D8]/5 to-[#18B8E6]/5 border border-[#1565D8]/10 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-800 mb-3">Donation queries?</p>
                {settings.phone && (
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm text-[#1565D8] font-medium hover:underline mb-2">
                    <Phone size={13}/> {settings.phone}
                  </a>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm text-[#1565D8] font-medium hover:underline">
                    <Mail size={13}/> {settings.email}
                  </a>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
