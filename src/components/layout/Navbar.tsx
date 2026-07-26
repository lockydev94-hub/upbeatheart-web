'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { SiteSettings, Disease, Blog } from '@/types/firestore'
import { cld } from '@/lib/cloudinary'
import {
  Phone, Menu, X, ChevronDown, ChevronRight,
  Calendar, Stethoscope, BookOpen, Heart, Users,
  Image as ImageIcon, Star, HelpCircle, Mail,
  ArrowRight, Tag,
} from 'lucide-react'

interface NavbarProps {
  settings:  SiteSettings
  diseases?: Disease[]
  blogs?:    Blog[]
}

const MORE_LINKS = [
  { label: 'Gallery',      href: '/gallery',  icon: ImageIcon, desc: 'Hospital & procedure gallery'    },
  { label: 'Reviews',      href: '/reviews',  icon: Star,      desc: 'Patient testimonials & ratings'  },
  { label: 'NGO Partners', href: '/ngo',      icon: Users,     desc: 'Our non-profit collaborations'   },
  { label: 'Contact',      href: '/contact',  icon: Phone,     desc: 'Get in touch with our team'      },
  { label: 'FAQ',          href: '/faq',      icon: HelpCircle,desc: 'Common questions answered'       },
]

/* ── WhatsApp icon ── */
function WhatsAppIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} aria-hidden>
      <path d="M12.031 0C5.384 0 .001 5.383.001 12.029c0 2.122.558 4.197 1.617 6.023L0 24l6.195-1.594A12.01 12.01 0 0012.03 24h.002C18.676 24 24.06 18.617 24.06 11.97 24.059 5.383 18.676 0 12.031 0zm0 21.95h-.002a9.966 9.966 0 01-5.082-1.391l-.363-.216-3.776.99 1.01-3.686-.237-.38a9.94 9.94 0 01-1.525-5.238c0-5.483 4.463-9.946 9.95-9.946 2.657 0 5.154 1.036 7.031 2.915a9.907 9.907 0 012.912 7.032c-.003 5.483-4.466 9.92-9.918 9.92zm5.453-7.44c-.298-.15-1.763-.87-2.036-.968-.273-.1-.472-.149-.671.15-.198.298-.768.968-.942 1.167-.174.199-.348.224-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.765-1.658-2.063-.173-.298-.018-.459.13-.607.134-.134.298-.349.447-.523.149-.174.199-.298.299-.497.1-.199.05-.373-.025-.522-.075-.15-.671-1.617-.919-2.214-.242-.581-.488-.502-.671-.511a12.06 12.06 0 00-.572-.01c-.199 0-.522.074-.795.373-.273.298-1.044 1.02-1.044 2.488 0 1.468 1.069 2.886 1.218 3.085.15.199 2.104 3.21 5.096 4.502.712.307 1.268.491 1.701.629.715.227 1.366.195 1.88.118.573-.086 1.763-.72 2.012-1.416.249-.696.249-1.292.174-1.416-.074-.124-.272-.198-.57-.347z"/>
    </svg>
  )
}

/* ── Hook: clamp a dropdown so it never overflows the viewport ── */
function useClampedDropdown(open: boolean) {
  const wrapRef  = useRef<HTMLDivElement>(null)   // the relative wrapper
  const dropRef  = useRef<HTMLDivElement>(null)   // the absolute dropdown
  const [style, setStyle] = useState<React.CSSProperties>({
    left: '50%',
    transform: 'translateX(-50%)',
  })

  useEffect(() => {
    if (!open || !wrapRef.current || !dropRef.current) return

    const wrapRect = wrapRef.current.getBoundingClientRect()
    const dropW    = dropRef.current.offsetWidth
    const vw       = window.innerWidth
    const GAP      = 16 // min margin from screen edge

    // Ideal: centred on the button
    let left = wrapRect.left + wrapRect.width / 2 - dropW / 2

    // Clamp so right edge doesn't overflow
    const maxLeft = vw - dropW - GAP
    if (left > maxLeft) left = maxLeft

    // Clamp so left edge doesn't overflow
    if (left < GAP) left = GAP

    // Convert back to position relative to the wrapper element
    const relLeft = left - wrapRect.left

    setStyle({ left: relLeft, transform: 'none' })
  }, [open])

  return { wrapRef, dropRef, style }
}

/* ── Treatments mega-menu ── */
function TreatmentsMegaMenu({
  diseases, isActive, open,
}: { diseases: Disease[]; isActive: (h: string) => boolean; open: boolean }) {
  const col1 = diseases.slice(0, 3)
  const col2 = diseases.slice(3, 6)
  const { wrapRef, dropRef, style } = useClampedDropdown(open)

  return (
    <div ref={wrapRef} className="absolute top-full mt-2 z-50 w-0">
      <div
        ref={dropRef}
        style={{ ...style, width: 680 }}
        className="absolute bg-white rounded-2xl border border-border/60 shadow-[0_16px_48px_rgba(21,101,216,0.14),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="h-1 w-full gradient-primary" />
        <div className="p-5">
          {/* header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary/60">
              Treatments & Conditions
            </p>
            <Link href="/treatments"
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              View All <ArrowRight size={11} />
            </Link>
          </div>

          {/* 2-col disease grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[col1, col2].map((col, ci) => (
              <div key={ci} className="space-y-1.5">
                {col.map(d => {
                  const img = typeof d.coverImage === 'object' && d.coverImage !== null
                    ? (d.coverImage as any).url
                    : d.coverImage as string | null
                  return (
                    <Link key={d.id} href={`/diseases/${d.slug}`}
                      className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-150 ${
                        isActive(`/diseases/${d.slug}`)
                          ? 'border-primary/25 bg-primary/5'
                          : 'border-transparent hover:border-primary/20 hover:bg-primary/4'
                      }`}>
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/8 shrink-0 flex items-center justify-center">
                        {img
                          ? <Image src={img} alt={d.title} width={36} height={36} className="w-full h-full object-cover" />
                          : <Heart size={14} className="text-primary" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary group-hover:text-primary leading-tight truncate transition-colors">
                          {d.title}
                        </p>
                        {d.category && (
                          <p className="text-[10px] text-text-secondary/60 mt-0.5 flex items-center gap-1">
                            <Tag size={8} />{d.category}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={12} className="text-primary/30 group-hover:text-primary shrink-0 transition-colors" />
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>

          {/* footer strip */}
          <div className="border-t border-border/50 pt-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link href="/treatments"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/8 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all">
                <Stethoscope size={11} /> All Treatments
              </Link>
              <Link href="/diseases"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-text-secondary text-xs font-semibold hover:bg-primary/8 hover:text-primary transition-all border border-border/60">
                <Heart size={11} /> All Diseases
              </Link>
            </div>
            <Link href="/appointment"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white gradient-primary shadow-sm hover:shadow-md transition-shadow">
              <Calendar size={11} /> Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Blogs mega-menu ── */
function BlogsMegaMenu({
  blogs, isActive, open,
}: { blogs: Blog[]; isActive: (h: string) => boolean; open: boolean }) {
  const col1 = blogs.slice(0, 3)
  const col2 = blogs.slice(3, 6)
  const { wrapRef, dropRef, style } = useClampedDropdown(open)

  return (
    <div ref={wrapRef} className="absolute top-full mt-2 z-50 w-0">
      <div
        ref={dropRef}
        style={{ ...style, width: 700 }}
        className="absolute bg-white rounded-2xl border border-border/60 shadow-[0_16px_48px_rgba(21,101,216,0.14),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="h-1 w-full gradient-primary" />
        <div className="p-5">
          {/* header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary/60">
              Latest Articles
            </p>
            <Link href="/blogs"
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              View All <ArrowRight size={11} />
            </Link>
          </div>

          {/* 2-col blogs grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[col1, col2].map((col, ci) => (
              <div key={ci} className="space-y-1.5">
                {col.map(b => (
                  <Link key={b.id} href={`/blogs/${b.slug}`}
                    className={`group flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 ${
                      isActive(`/blogs/${b.slug}`)
                        ? 'border-primary/25 bg-primary/5'
                        : 'border-transparent hover:border-primary/20 hover:bg-primary/4'
                    }`}>
                    <div className="w-14 h-11 rounded-lg overflow-hidden bg-primary/8 shrink-0 flex items-center justify-center">
                      {b.coverImage
                        ? <Image src={b.coverImage} alt={b.title} width={56} height={44} className="w-full h-full object-cover" />
                        : <BookOpen size={14} className="text-primary" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary leading-snug line-clamp-2 transition-colors">
                        {b.title}
                      </p>
                      {b.category && (
                        <span className="inline-block text-[10px] text-primary bg-primary/8 px-1.5 py-0.5 rounded font-medium mt-1">
                          {b.category}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* footer strip */}
          <div className="border-t border-border/50 pt-3.5 flex items-center justify-between gap-3">
            <p className="text-[11px] text-text-secondary/60">
              Expert cardiology articles &amp; health guides
            </p>
            <Link href="/blogs"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white gradient-primary shadow-sm hover:shadow-md transition-shadow">
              <BookOpen size={11} /> All Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── More dropdown (4-col) ── */
function MoreDropdown({
  isActive, open,
}: { isActive: (h: string) => boolean; open: boolean }) {
  const { wrapRef, dropRef, style } = useClampedDropdown(open)

  return (
    <div ref={wrapRef} className="absolute top-full mt-2 z-50 w-0">
      <div
        ref={dropRef}
        style={{ ...style, width: 640 }}
        className="absolute bg-white rounded-2xl border border-border/60 shadow-[0_16px_48px_rgba(21,101,216,0.14),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="h-1 w-full gradient-primary" />
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary/60 mb-3 px-1">More</p>
          <div className="grid grid-cols-4 gap-2">
            {MORE_LINKS.map(child => (
              <Link key={child.href} href={child.href}
                className={`group/item flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${
                  isActive(child.href)
                    ? 'border-primary/25 bg-primary/5 shadow-sm'
                    : 'border-transparent hover:border-primary/20 hover:bg-primary/4 hover:shadow-sm'
                }`}>
                <span className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive(child.href)
                    ? 'bg-primary text-white'
                    : 'bg-primary/8 text-primary group-hover/item:bg-primary group-hover/item:text-white'
                }`}>
                  <child.icon size={15} />
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${
                    isActive(child.href) ? 'text-primary' : 'text-text-primary group-hover/item:text-primary'
                  }`}>{child.label}</p>
                  <p className="text-[11px] text-text-secondary/70 mt-0.5 leading-snug">{child.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-[11px] text-text-secondary/60">Need help? Call us or chat on WhatsApp</span>
            <Link href="/appointment"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white gradient-primary shadow-sm hover:shadow-md transition-shadow">
              <Calendar size={11} /> Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Navbar ── */
export default function Navbar({ settings, diseases = [], blogs = [] }: NavbarProps) {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop,   setOpenDrop]   = useState<string | null>(null)
  const pathname = usePathname()
  const navRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDrop(null)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => { setMobileOpen(false); setOpenDrop(null) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const phoneClean = settings.phone?.replace(/\D/g, '') || ''
  const waClean    = settings.whatsapp?.replace(/\D/g, '') || ''

  const announcementText = settings.appointmentsOpen
    ? `Appointments are open${settings.doctorName ? ` — Book with ${settings.doctorName} today` : ''}`
    : (settings.appointmentNote || 'Appointments temporarily closed — call us for enquiries')

  const toggle = (label: string) =>
    setOpenDrop(prev => prev === label ? null : label)

  return (
    <>
      {/* ── Slim top bar ── */}
      <div className="hidden md:block bg-navy text-white/80 text-xs py-2 border-b border-white/5">
        <div className="container-max px-4 md:px-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 truncate">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              settings.appointmentsOpen ? 'bg-green animate-pulse' : 'bg-warning'
            }`} />
            <span className="opacity-70 truncate">{announcementText}</span>
          </span>
          <div className="flex items-center gap-5 shrink-0">
            {(settings.emailAlt || settings.email) && (
              <a href={`mailto:${settings.emailAlt || settings.email}`}
                className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
                <Mail size={10} />{settings.emailAlt || settings.email}
              </a>
            )}
            {settings.phoneAlt && (
              <a href={`tel:${settings.phoneAlt.replace(/\D/g,'')}`}
                className="opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5 font-medium">
                <Phone size={10} />{settings.phoneAlt}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${phoneClean}`}
                className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1.5 font-semibold">
                <Phone size={10} />{settings.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(21,101,216,0.08)] border-b border-border/60'
          : 'bg-white border-b border-border/40'
      }`}>
        <div className="container-max px-4 md:px-8">
          <div className="flex items-center justify-between h-[76px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              {settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.siteTitle || 'UpBeat Heart'}
                  width={220} height={56} className="h-14 w-auto object-contain" priority />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M3 12h3l2-7 4 14 3-8 2 4 2-3h2" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="leading-tight">
                    <span className="block text-base font-extrabold text-navy tracking-tight leading-none">
                      {settings.siteTitle || 'UpBeat Heart'}
                    </span>
                    {settings.doctorTitle && (
                      <span className="block text-[9px] font-semibold text-primary/70 uppercase tracking-[0.13em] mt-0.5">
                        {settings.doctorTitle}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>

            {/* ── Desktop nav ── */}
            <nav ref={navRef} className="hidden lg:flex items-center gap-0.5">

              {/* Static links */}
              {[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }].map(link => (
                <Link key={link.href} href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/8 font-semibold'
                      : 'text-text-primary hover:text-primary hover:bg-primary/5'
                  }`}>
                  {link.label}
                </Link>
              ))}

              {/* Treatments */}
              <div className="relative">
                <button onClick={() => toggle('Treatments')}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    openDrop === 'Treatments' || isActive('/treatments') || isActive('/diseases')
                      ? 'text-primary bg-primary/8'
                      : 'text-text-primary hover:text-primary hover:bg-primary/5'
                  }`}>
                  Treatments
                  <ChevronDown size={13} className={`transition-transform duration-200 ${openDrop === 'Treatments' ? 'rotate-180' : ''}`} />
                </button>
                {openDrop === 'Treatments' && (
                  <TreatmentsMegaMenu diseases={diseases} isActive={isActive} open={openDrop === 'Treatments'} />
                )}
              </div>

              {/* Patient Assistance */}
              <Link href="/patient-assistance"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/patient-assistance')
                    ? 'text-primary bg-primary/8 font-semibold'
                    : 'text-text-primary hover:text-primary hover:bg-primary/5'
                }`}>
                Patient Assistance
              </Link>

              {/* Blogs */}
              <div className="relative">
                <button onClick={() => toggle('Blogs')}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    openDrop === 'Blogs' || isActive('/blogs')
                      ? 'text-primary bg-primary/8'
                      : 'text-text-primary hover:text-primary hover:bg-primary/5'
                  }`}>
                  Blogs
                  <ChevronDown size={13} className={`transition-transform duration-200 ${openDrop === 'Blogs' ? 'rotate-180' : ''}`} />
                </button>
                {openDrop === 'Blogs' && (
                  <BlogsMegaMenu blogs={blogs} isActive={isActive} open={openDrop === 'Blogs'} />
                )}
              </div>

              {/* More */}
              <div className="relative">
                <button onClick={() => toggle('More')}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    openDrop === 'More'
                      ? 'text-primary bg-primary/8'
                      : 'text-text-primary hover:text-primary hover:bg-primary/5'
                  }`}>
                  More
                  <ChevronDown size={13} className={`transition-transform duration-200 ${openDrop === 'More' ? 'rotate-180' : ''}`} />
                </button>
                {openDrop === 'More' && (
                  <MoreDropdown isActive={isActive} open={openDrop === 'More'} />
                )}
              </div>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2.5">
              {waClean && (
                <a href={`https://wa.me/${waClean}`} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#25D366]/40 text-[#128C7E] bg-[#25D366]/5 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all duration-200 shadow-sm hover:shadow-md">
                  <WhatsAppIcon size={15} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span>WhatsApp</span>
                </a>
              )}
              <Link href="/appointment"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold text-white gradient-primary shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all">
                <Calendar size={14} />
                Book Appointment
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-primary/5 transition-colors"
              aria-label="Toggle menu">
              {mobileOpen ? <X size={22} className="text-navy" /> : <Menu size={22} className="text-navy" />}
            </button>
          </div>
        </div>

        {/* ── ECG line ── */}
        <div className="relative w-full h-[44px] overflow-visible" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/4 via-cyan/5 to-green/4" />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 44" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#1565D8" stopOpacity="0.12" />
                <stop offset="45%"  stopColor="#18B8E6" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#18B55A" stopOpacity="0.12" />
              </linearGradient>
              <filter id="ecgGlow">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <line x1="0" y1="22" x2="1440" y2="22" stroke="url(#ecgGrad)" strokeWidth="0.6" />
            {[0,160,320,480,640,800,960,1120,1280].map(o => (
              <polyline key={o}
                points={`${o},22 ${o+20},22 ${o+30},22 ${o+36},6 ${o+42},38 ${o+48},22 ${o+56},22 ${o+64},13 ${o+68},31 ${o+72},22 ${o+160},22`}
                fill="none" stroke="url(#ecgGrad)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" filter="url(#ecgGlow)"
              />
            ))}
            <circle r="2.2" fill="#18B8E6" opacity="0.9" filter="url(#ecgGlow)">
              <animateMotion dur="3.5s" repeatCount="indefinite"
                path="M0,22 L20,22 L30,22 L36,6 L42,38 L48,22 L56,22 L64,13 L68,31 L72,22 L160,22 L180,22 L190,22 L196,6 L202,38 L208,22 L216,22 L224,13 L228,31 L232,22 L320,22 L340,22 L350,22 L356,6 L362,38 L368,22 L376,22 L384,13 L388,31 L392,22 L480,22 L500,22 L510,22 L516,6 L522,38 L528,22 L536,22 L544,13 L548,31 L552,22 L640,22 L660,22 L670,22 L676,6 L682,38 L688,22 L696,22 L704,13 L708,31 L712,22 L800,22 L820,22 L830,22 L836,6 L842,38 L848,22 L856,22 L864,13 L868,31 L872,22 L960,22 L980,22 L990,22 L996,6 L1002,38 L1008,22 L1016,22 L1024,13 L1028,31 L1032,22 L1120,22 L1140,22 L1150,22 L1156,6 L1162,38 L1168,22 L1176,22 L1184,13 L1188,31 L1192,22 L1280,22 L1300,22 L1310,22 L1316,6 L1322,38 L1328,22 L1336,22 L1344,13 L1348,31 L1352,22 L1440,22"
              />
            </circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative flex items-center justify-center" style={{ animation: 'heartbeat 1.2s ease-in-out infinite' }}>
              <span className="absolute rounded-full" style={{ width: '52px', height: '52px', background: 'radial-gradient(circle, rgba(239,68,68,0.22) 0%, transparent 70%)', animation: 'heartPing 1.2s ease-in-out infinite' }} />
              <Image src="/images/heart-image.png" alt="Heart" width={24} height={40}
                className="relative z-10 object-contain select-none"
                style={{ width: '24px', height: '40px', filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.5)) drop-shadow(0 1px 3px rgba(0,0,0,0.12))' }}
                priority />
            </div>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div className={`lg:hidden border-t border-border/40 bg-white overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[calc(100vh-76px)] overflow-y-auto' : 'max-h-0'
        }`}>
          <div className="container-max px-4 py-4 space-y-0.5">

            {[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }].map(link => (
              <Link key={link.href} href={link.href}
                className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href) ? 'text-primary bg-primary/8 font-semibold' : 'text-text-primary hover:bg-primary/5 hover:text-primary'
                }`}>
                {link.label}<ChevronRight size={13} className="opacity-25" />
              </Link>
            ))}

            {/* Treatments mobile */}
            <div>
              <button onClick={() => toggle('Treatments')}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-text-primary hover:bg-primary/5 hover:text-primary transition-colors">
                Treatments
                <ChevronDown size={14} className={`transition-transform ${openDrop === 'Treatments' ? 'rotate-180' : ''}`} />
              </button>
              {openDrop === 'Treatments' && (
                <div className="ml-3 mb-1 border-l-2 border-border pl-3 space-y-0.5">
                  <Link href="/treatments" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-primary transition-colors">
                    <Stethoscope size={13} /><span className="font-medium">All Treatments</span>
                  </Link>
                  <Link href="/diseases" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-primary transition-colors">
                    <Heart size={13} /><span className="font-medium">All Diseases</span>
                  </Link>
                  {diseases.slice(0, 4).map(d => (
                    <Link key={d.id} href={`/diseases/${d.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-primary transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                      {d.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/patient-assistance"
              className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive('/patient-assistance') ? 'text-primary bg-primary/8 font-semibold' : 'text-text-primary hover:bg-primary/5 hover:text-primary'
              }`}>
              Patient Assistance<ChevronRight size={13} className="opacity-25" />
            </Link>

            {/* Blogs mobile */}
            <div>
              <button onClick={() => toggle('Blogs')}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-text-primary hover:bg-primary/5 hover:text-primary transition-colors">
                Blogs
                <ChevronDown size={14} className={`transition-transform ${openDrop === 'Blogs' ? 'rotate-180' : ''}`} />
              </button>
              {openDrop === 'Blogs' && (
                <div className="ml-3 mb-1 border-l-2 border-border pl-3 space-y-0.5">
                  <Link href="/blogs" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-primary transition-colors">
                    <BookOpen size={13} /><span className="font-medium">All Articles</span>
                  </Link>
                  {blogs.slice(0, 4).map(b => (
                    <Link key={b.id} href={`/blogs/${b.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-primary transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                      <span className="line-clamp-1">{b.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* More mobile */}
            <div>
              <button onClick={() => toggle('More')}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-text-primary hover:bg-primary/5 hover:text-primary transition-colors">
                More
                <ChevronDown size={14} className={`transition-transform ${openDrop === 'More' ? 'rotate-180' : ''}`} />
              </button>
              {openDrop === 'More' && (
                <div className="ml-3 mb-1 border-l-2 border-border pl-3 space-y-0.5">
                  {MORE_LINKS.map(child => (
                    <Link key={child.href} href={child.href}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive(child.href) ? 'text-primary font-semibold bg-primary/5' : 'text-text-secondary hover:text-primary'
                      }`}>
                      <child.icon size={13} />
                      <div>
                        <p className="font-medium">{child.label}</p>
                        <p className="text-[10px] text-text-secondary/60 mt-0.5">{child.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile CTAs */}
            <div className="pt-3 pb-2 flex flex-col gap-2 border-t border-border mt-2">
              {settings.phone && (
                <a href={`tel:${phoneClean}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors">
                  <Phone size={15} />{settings.phone}
                </a>
              )}
              {waClean && (
                <a href={`https://wa.me/${waClean}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#25D366]/40 bg-[#25D366]/5 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all">
                  <WhatsAppIcon size={16} />WhatsApp
                </a>
              )}
              <Link href="/appointment"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white gradient-primary shadow-md">
                <Calendar size={15} /> Book Appointment
              </Link>
            </div>

            {settings.doctorName && (
              <div className="mt-1 px-3.5 py-3 rounded-xl bg-bg border border-border/60 flex items-center gap-3">
                {settings.doctorPhotoUrl ? (
                  <Image src={cld.avatarSm(settings.doctorPhotoUrl)} alt={settings.doctorName}
                    width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0 border border-border" />
                ) : (
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">
                      {settings.doctorName.replace(/^Dr\.?\s*/i,'').charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-navy truncate">{settings.doctorName}</p>
                  <p className="text-[10px] text-text-secondary truncate">{settings.doctorTitle}</p>
                  {settings.hospitalName && (
                    <p className="text-[10px] text-text-secondary/70 truncate">{settings.hospitalName}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <style jsx global>{`
        @keyframes heartbeat {
          0%   { transform: scale(1);    }
          14%  { transform: scale(1.28); }
          28%  { transform: scale(1);    }
          42%  { transform: scale(1.18); }
          70%  { transform: scale(1);    }
          100% { transform: scale(1);    }
        }
        @keyframes heartPing {
          0%   { transform: scale(0.6); opacity: 0.7; }
          50%  { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(0.6); opacity: 0.7; }
        }
      `}</style>
    </>
  )
}
