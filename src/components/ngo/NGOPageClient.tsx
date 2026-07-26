'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2, Globe, MapPin, Users, Heart, CheckCircle2,
  Handshake, ArrowRight, Send, Phone, Mail, X, ChevronDown, ChevronUp,
  Upload, Loader2, CheckCircle, Trash2, ImageIcon, AlertCircle,
} from 'lucide-react'
import type { NGO } from '@/types/firestore'
import type { SiteSettings } from '@/types/firestore'
import LazyImage from '@/components/ui/LazyImage'

interface Props {
  ngos:     NGO[]
  settings: SiteSettings | null
}

/* ── Cloudinary logo uploader (client-side, unsigned preset) ─────────────── */
const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'boc8bvoc'
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'upbeat_public'
const LOGO_FOLDER   = 'upbeatheart/ngos/logos'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

interface LogoUploaderProps {
  value:    string       // current Cloudinary URL or ''
  onChange: (url: string) => void
}

function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const inputRef             = useRef<HTMLInputElement>(null)
  const [state, setState]    = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [errMsg, setErrMsg]  = useState('')
  const [dragging, setDragging] = useState(false)

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrMsg('Please upload an image file (PNG, JPG, SVG).')
      setState('error')
      return
    }
    setState('uploading')
    setProgress(0)
    setErrMsg('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', LOGO_FOLDER)

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        })
        xhr.addEventListener('load', () => {
          try {
            const d = JSON.parse(xhr.responseText)
            if (d.error) { reject(new Error(d.error.message)); return }
            onChange(d.secure_url)
            setState('done')
            resolve()
          } catch { reject(new Error('Parse error')) }
        })
        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.send(fd)
      })
    } catch (err: any) {
      setErrMsg(err.message ?? 'Upload failed. Please try again.')
      setState('error')
    }
  }, [onChange])

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) upload(files[0])
  }

  const remove = () => {
    onChange('')
    setState('idle')
    setProgress(0)
    setErrMsg('')
  }

  /* ── render: logo present ── */
  if (value) {
    return (
      <div className="flex items-center gap-4">
        {/* preview */}
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 bg-bg shrink-0">
          <LazyImage src={value} alt="NGO Logo" rootMargin="0px" className="absolute inset-0 w-full h-full object-contain p-1.5" />
          <span className="absolute bottom-0 inset-x-0 text-center text-[8px] font-bold bg-green/90 text-white py-0.5">
            ✓ Uploaded
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-green flex items-center gap-1">
            <CheckCircle size={12} /> Logo uploaded successfully
          </p>
          <p className="text-[11px] text-text-secondary mt-0.5 truncate">{value.split('/').pop()}</p>
          <button
            type="button"
            onClick={remove}
            className="mt-2 flex items-center gap-1 text-[11px] text-red-500 hover:underline font-medium"
          >
            <Trash2 size={10} /> Remove &amp; re-upload
          </button>
        </div>
      </div>
    )
  }

  /* ── render: uploading ── */
  if (state === 'uploading') {
    return (
      <div className="border-2 border-dashed border-primary/30 rounded-xl p-5 bg-primary/3">
        <div className="flex items-center gap-3 mb-2">
          <Loader2 size={18} className="text-primary animate-spin shrink-0" />
          <span className="text-sm font-medium text-primary">Uploading logo… {progress}%</span>
        </div>
        <div className="w-full bg-primary/10 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  /* ── render: drop zone ── */
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-primary bg-primary/6 scale-[1.01]'
            : 'border-border hover:border-primary/40 hover:bg-primary/3'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-2">
          <ImageIcon size={18} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-navy">
          Drop your NGO logo here
        </p>
        <p className="text-[11px] text-text-secondary mt-0.5">
          or <span className="text-primary font-semibold">browse to upload</span>
        </p>
        <p className="text-[10px] text-text-secondary mt-1.5 opacity-70">
          PNG · JPG · SVG — square preferred, max 5 MB
        </p>
      </div>

      {state === 'error' && errMsg && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <AlertCircle size={12} className="shrink-0" /> {errMsg}
        </div>
      )}

      <p className="text-[10px] text-text-secondary mt-1.5 opacity-70">
        Optional — helps identify your organisation in our directory.
      </p>
    </div>
  )
}

/* ── NGO Card ─────────────────────────────────────────────────────────────── */
function NGOCard({ ngo }: { ngo: NGO }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="group bg-white rounded-2xl border border-border hover:border-primary/25 hover:shadow-[0_8px_32px_rgba(21,101,216,0.1)] transition-all duration-300 overflow-hidden">

      {/* top accent on hover */}
      <div className="h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6">
        {/* logo + verified */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-bg border border-border flex items-center justify-center shrink-0">
            {ngo.logoUrl ? (
              <LazyImage
                src={ngo.logoUrl}
                alt={ngo.name}
                revealBlur
                className="absolute inset-0 w-full h-full object-contain p-1"
              />
            ) : (
              <Building2 size={28} className="text-primary/40" />
            )}
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-green bg-green/8 border border-green/20 px-2 py-1 rounded-full">
            <CheckCircle2 size={10} /> Verified
          </span>
        </div>

        {/* name */}
        <h3 className="text-base font-extrabold text-navy leading-tight mb-1">{ngo.name}</h3>

        {/* address */}
        {ngo.address && (
          <p className="flex items-center gap-1.5 text-[11px] text-text-secondary mb-3">
            <MapPin size={11} className="shrink-0" /> {ngo.address}
          </p>
        )}

        {/* description */}
        {ngo.description && (
          <p className={`text-[12px] text-text-secondary leading-relaxed mb-4 ${expanded ? '' : 'line-clamp-2'}`}>
            {ngo.description}
          </p>
        )}

        {/* expand toggle */}
        {ngo.description && ngo.description.length > 100 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[11px] text-primary font-semibold mb-3 hover:underline"
          >
            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
          </button>
        )}

        {/* website link */}
        {ngo.website && (
          <a
            href={ngo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
          >
            <Globe size={11} /> Visit Website <ArrowRight size={10} />
          </a>
        )}
      </div>
    </div>
  )
}

/* ── Registration Form ────────────────────────────────────────────────────── */
const BLANK = {
  name: '', contactPerson: '', email: '', phone: '',
  address: '', website: '', description: '',
}

function RegisterForm() {
  const [form, setForm]       = useState(BLANK)
  const [logoUrl, setLogoUrl] = useState('')
  const [submitting, setSub]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('NGO name, email and phone are required.')
      return
    }
    setSub(true)
    setError('')
    try {
      const res = await fetch('/api/ngo-register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, logoUrl: logoUrl || null, status: 'pending' }),
      })
      if (!res.ok) throw new Error('Failed')
      setSuccess(true)
      setForm(BLANK)
      setLogoUrl('')
    } catch {
      setError('Something went wrong. Please try again or call us directly.')
    } finally {
      setSub(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green/10 border border-green/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-navy">Application Received!</h3>
          <p className="text-text-secondary text-sm mt-1 max-w-sm">
            Our team will review your application and get back to you within 2–3 business days.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
        >
          Submit another <ArrowRight size={13} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Logo upload — first, prominent */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
          <ImageIcon size={12} className="text-primary" />
          Organisation Logo
          <span className="font-normal text-text-secondary">(optional)</span>
        </label>
        <LogoUploader value={logoUrl} onChange={setLogoUrl} />
      </div>

      <div className="border-t border-border pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Organisation Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { label: 'NGO / Organisation Name *', key: 'name',          type: 'text',  placeholder: 'Heart Care Foundation' },
            { label: 'Contact Person *',           key: 'contactPerson', type: 'text',  placeholder: 'Full name' },
            { label: 'Email Address *',            key: 'email',         type: 'email', placeholder: 'contact@ngo.org' },
            { label: 'Phone Number *',             key: 'phone',         type: 'tel',   placeholder: '+91 98765 43210' },
            { label: 'Website',                    key: 'website',       type: 'url',   placeholder: 'https://ngo.org' },
            { label: 'City / Address',             key: 'address',       type: 'text',  placeholder: 'Bhubaneswar, Odisha' },
          ] as { label: string; key: keyof typeof BLANK; type: string; placeholder: string }[]).map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">About Your Organisation</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          placeholder="Briefly describe your NGO's mission, current work, and how you'd like to partner with us…"
          rows={4}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white resize-none"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <X size={14} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white gradient-primary shadow-[0_4px_20px_rgba(21,101,216,0.25)] hover:opacity-90 transition disabled:opacity-60"
      >
        <Send size={14} />
        {submitting ? 'Submitting…' : 'Submit Partnership Application'}
      </button>

      <p className="text-[11px] text-text-secondary">
        By submitting, you agree that our team may contact you to discuss the partnership.
        All applications are reviewed within 2–3 business days.
      </p>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function NGOPageClient({ ngos, settings }: Props) {
  const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://upbeatheart.com'
  const whatsapp   = settings?.whatsapp?.replace(/\D/g, '') ?? ''
  const waLink     = whatsapp ? `https://wa.me/${whatsapp}?text=Hi, I'd like to partner with UpBeat Heart as an NGO.` : '#'

  const features = [
    { icon: Users,    title: 'Community Health Camps',  desc: 'Free cardiac screenings in underserved rural and urban areas.',         color: 'bg-primary' },
    { icon: Globe,    title: 'Awareness Drives',        desc: 'Heart health education programmes reaching thousands annually.',          color: 'bg-cyan'    },
    { icon: Heart,    title: 'Patient Assistance',      desc: 'NGO-sponsored funding for patients unable to afford treatment.',          color: 'bg-green'   },
    { icon: Handshake,title: 'Referral Network',        desc: 'Seamless access to specialist cardiac care via NGO partner referrals.',   color: 'bg-navy'    },
  ]

  return (
    <main>
      {/* ── Hero ── */}
      <section className="py-20 md:py-28 gradient-dark text-white relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan/10 rounded-full blur-2xl pointer-events-none" />

        <div className="container-max px-4 md:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-[11px] font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              NGO Collaboration
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Partner With<br />
              <span className="text-cyan">UpBeat Heart</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-xl mb-8">
              Together with trusted non-profit partners, we bring life-saving cardiac care to communities
              that need it most — through health camps, patient assistance, and awareness programmes.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-green text-white hover:bg-green/90 transition shadow-lg shadow-green/20">
                <Handshake size={15} /> Partner With Us
              </a>
              <a href="#directory"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition">
                View NGO Directory <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-navy py-10">
        <div className="container-max px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: ngos.length > 0 ? `${ngos.length}+` : '30+', label: 'Trusted Partners' },
              { value: '50K+', label: 'Patients Reached' },
              { value: '120+', label: 'Health Camps' },
              { value: '100%', label: 'Verified NGOs' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-white/50 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How We Collaborate ── */}
      <section className="py-16 md:py-24 bg-bg">
        <div className="container-max px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy">How We Collaborate</h2>
            <p className="text-text-secondary mt-3 max-w-xl mx-auto">
              Our NGO partnerships work across four key pillars of cardiac care outreach.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className="bg-white rounded-2xl border border-border p-6 hover:border-primary/25 hover:shadow-[0_4px_24px_rgba(21,101,216,0.08)] transition-all">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-[14px] font-extrabold text-navy mb-1.5">{title}</h3>
                <p className="text-[12px] text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NGO Directory ── */}
      <section id="directory" className="py-16 md:py-24 bg-white">
        <div className="container-max px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy">Our Trusted Partners</h2>
              <p className="text-text-secondary mt-2">
                {ngos.length > 0
                  ? `${ngos.length} verified NGO${ngos.length !== 1 ? 's' : ''} working with us`
                  : 'Our growing network of non-profit partners'}
              </p>
            </div>
            <a href="#register"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border-2 border-primary/25 text-primary hover:bg-primary hover:text-white transition shrink-0">
              <PlusIcon /> Become a Partner
            </a>
          </div>

          {ngos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-bg border border-border flex items-center justify-center mb-4">
                <Handshake size={36} className="text-primary/30" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Building Our Network</h3>
              <p className="text-text-secondary text-sm max-w-sm">
                We&apos;re actively partnering with NGOs across the region.
                Be the first to join our growing network.
              </p>
              <a href="#register"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white gradient-primary hover:opacity-90 transition">
                <Handshake size={14} /> Apply to Partner
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ngos.map(ngo => <NGOCard key={ngo.id} ngo={ngo} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Registration Form ── */}
      <section id="register" className="py-16 md:py-24 bg-bg">
        <div className="container-max px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

            {/* Left — info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/6 border border-primary/15 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Join the Network
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight">
                  Partner With Us
                </h2>
                <p className="text-text-secondary mt-3 leading-relaxed">
                  We welcome non-profit organisations committed to cardiac health outreach.
                  Tell us about your work and we&apos;ll be in touch within 2–3 business days.
                </p>
              </div>

              {/* Approval workflow note */}
              <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
                <p className="text-xs font-bold text-navy uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" /> How Approval Works
                </p>
                {[
                  { step: '1', text: 'Submit your application below' },
                  { step: '2', text: 'Admin team reviews within 2–3 days' },
                  { step: '3', text: 'Doctor approves verified NGOs' },
                  { step: '4', text: 'Your NGO appears in our public directory' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3 text-sm text-text-secondary">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0">
                      {step}
                    </span>
                    {text}
                  </div>
                ))}
              </div>

              {/* checklist */}
              <ul className="space-y-3">
                {[
                  'Co-organise free cardiac screening camps',
                  'Refer patients for subsidised treatment',
                  'Run joint awareness programmes',
                  'Access doctor expertise for your community',
                  'Get listed in our verified NGO directory',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                    <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* alternate contact */}
              <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
                <p className="text-[12px] font-bold text-navy uppercase tracking-wide">Prefer to contact us directly?</p>
                {settings?.phone && (
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-primary transition">
                    <Phone size={14} className="text-primary" /> {settings.phone}
                  </a>
                )}
                {settings?.email && (
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-primary transition">
                    <Mail size={14} className="text-primary" /> {settings.email}
                  </a>
                )}
                {whatsapp && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-green hover:underline font-medium">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Us
                  </a>
                )}
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-extrabold text-navy mb-1">Partnership Application</h3>
              <p className="text-[12px] text-text-secondary mb-6">Fill in the details below — our team will review and contact you.</p>
              <RegisterForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}
