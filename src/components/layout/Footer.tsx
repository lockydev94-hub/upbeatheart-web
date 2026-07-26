import Link from 'next/link'
import Image from 'next/image'
import type { SiteSettings } from '@/types/firestore'
import { cld } from '@/lib/cloudinary'
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react'

interface FooterProps { settings: SiteSettings }

// ── Navigation columns ────────────────────────────────────────────────────────
const SERVICES = [
  { label: 'Cardiology Treatments',   href: '/treatments' },
  { label: 'Diseases & Conditions',   href: '/diseases' },
  { label: 'Patient Assistance',       href: '/patient-assistance' },
  { label: 'Book Appointment',         href: '/appointment' },
  { label: 'NGO Partners',             href: '/ngo' },
]
const COMPANY = [
  { label: 'About the Doctor', href: '/about' },
  { label: 'Medical Blog',     href: '/blogs' },
  { label: 'Gallery',          href: '/gallery' },
  { label: 'Patient Reviews',  href: '/reviews' },
  { label: 'Contact Us',       href: '/contact' },
]
const LEGAL = [
  { label: 'FAQ',            href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms' },
  { label: 'Sitemap',        href: '/sitemap.xml', external: true },
]

// ── Helper: build full social URL from handle or full URL ─────────────────────
function buildSocialUrl(value: string, base: string): string {
  if (!value) return ''
  if (value.startsWith('http')) return value
  return `${base}${value.replace(/^@/, '')}`
}

// ── Format "09:00" → "9 AM", "17:00" → "5 PM" ───────────────────────────────
function fmt(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const s = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return m ? `${hr}:${String(m).padStart(2, '0')} ${s}` : `${hr} ${s}`
}

const DAY_SHORT: Record<string, string> = {
  Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed',
  Thursday:'Thu', Friday:'Fri', Saturday:'Sat', Sunday:'Sun',
}

export default function Footer({ settings }: FooterProps) {
  const phoneClean = settings.phone?.replace(/\D/g, '') || ''
  const waClean    = settings.whatsapp?.replace(/\D/g, '') || ''
  const year       = new Date().getFullYear()

  // ── Social links — built from admin fields ────────────────────────────────
  const socials = [
    {
      label: 'Facebook',
      href:  buildSocialUrl(settings.facebook,  'https://facebook.com/'),
      color: '#1877F2',
      svg: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>,
    },
    {
      label: 'Instagram',
      href:  buildSocialUrl(settings.instagram, 'https://instagram.com/'),
      color: '#E4405F',
      svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
    },
    {
      label: 'YouTube',
      href:  settings.youtube || '',
      color: '#FF0000',
      svg: <><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></>,
    },
    {
      label: 'LinkedIn',
      href:  settings.linkedin || '',
      color: '#0A66C2',
      svg: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
    },
    {
      label: 'X / Twitter',
      href:  buildSocialUrl(settings.twitter, 'https://x.com/'),
      color: '#1DA1F2',
      svg: <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>,
    },
  ].filter(s => s.href)

  // ── Clinic hours: open days and closed days ───────────────────────────────
  const openDays   = (settings.clinicHours || []).filter(d => !d.closed)
  const closedDays = (settings.clinicHours || []).filter(d =>  d.closed).map(d => DAY_SHORT[d.day] || d.day)

  // ── Google Maps / Business links ──────────────────────────────────────────
  const mapsLink    = settings.mapsLink || (settings.mapsEmbedUrl ? '#' : '')
  const bizLink     = settings.googleBusiness || ''
  const mapsProfile = settings.googleMapsProfile || ''

  return (
    <footer>
      {/* ── Main footer body ── */}
      <div className="bg-navy text-white/75 py-16 px-4">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10 xl:gap-6">

            {/* ── Brand + Doctor card ── */}
            <div className="xl:col-span-2">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                {settings.logoUrl ? (
                  <Image src={settings.logoUrl} alt={settings.siteTitle || 'UpBeat Heart'}
                    width={120} height={36} className="h-8 w-auto brightness-0 invert" />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                        <path d="M3 12h3l2-7 4 14 3-8 2 4 2-3h2" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-white">{settings.siteTitle || 'UpBeat Heart'}</span>
                      <span className="block text-[9px] text-white/40 uppercase tracking-widest">Cardiology Care</span>
                    </div>
                  </div>
                )}
              </Link>

              {/* Doctor profile card — pulled from admin Doctor Profile tab */}
              {settings.doctorName && (
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    {settings.doctorPhotoUrl ? (
                      <Image src={cld.avatarSm(settings.doctorPhotoUrl)} alt={settings.doctorName}
                        width={44} height={44} className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">
                          {settings.doctorName.replace(/^Dr\.?\s*/i,'').charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm leading-tight">{settings.doctorName}</p>
                      {settings.doctorTitle && (
                        <p className="text-white/60 text-xs mt-0.5">{settings.doctorTitle}</p>
                      )}
                      {settings.doctorQuals && (
                        <p className="text-cyan/70 text-xs mt-1 font-medium">{settings.doctorQuals}</p>
                      )}
                    </div>
                  </div>
                  {(settings.doctorExperience || settings.hospitalName) && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/45">
                      {settings.doctorExperience && (
                        <span>⏱ {settings.doctorExperience} experience</span>
                      )}
                      {settings.hospitalName && (
                        <span>🏥 {settings.hospitalName}{settings.hospitalAddress ? `, ${settings.hospitalAddress}` : ''}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Site description */}
              {settings.siteDescription && (
                <p className="text-white/45 text-xs leading-relaxed mb-5">{settings.siteDescription}</p>
              )}

              {/* Social icons — built from admin Social tab */}
              {socials.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {socials.map(({ href, label, color, svg }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                      className="group w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center transition-all hover:border-white/30 hover:scale-105">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" width="14" height="14"
                        className="text-white/50 group-hover:text-white transition-colors">
                        {svg}
                      </svg>
                    </a>
                  ))}
                  {bizLink && (
                    <a href={bizLink} target="_blank" rel="noopener noreferrer" aria-label="Google Business"
                      className="group w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center transition-all hover:border-white/30">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" className="text-white/50 group-hover:text-white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ── Services column ── */}
            <div>
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-5">Services</h4>
              <ul className="space-y-3">
                {SERVICES.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
                      <span className="w-1 h-1 rounded-full bg-cyan/50 group-hover:bg-cyan transition-colors shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Company + Legal column ── */}
            <div>
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-5">Company</h4>
              <ul className="space-y-3 mb-7">
                {COMPANY.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
                      <span className="w-1 h-1 rounded-full bg-cyan/50 group-hover:bg-cyan transition-colors shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-3">
                {LEGAL.map(({ label, href, ...rest }) => {
                  const isExt = (rest as { external?: boolean }).external
                  return (
                    <li key={label}>
                      {isExt ? (
                        <a href={href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
                          <span className="w-1 h-1 rounded-full bg-cyan/50 group-hover:bg-cyan transition-colors shrink-0" />
                          {label}
                          <ExternalLink size={10} className="ml-0.5 text-white/30 group-hover:text-white/60" />
                        </a>
                      ) : (
                        <Link href={href} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
                          <span className="w-1 h-1 rounded-full bg-cyan/50 group-hover:bg-cyan transition-colors shrink-0" />
                          {label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* ── Contact + Clinic Hours ── */}
            <div>
              <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-5">Contact</h4>
              <ul className="space-y-3.5 mb-7">

                {/* Primary phone */}
                {settings.phone && (
                  <li>
                    <a href={`tel:${phoneClean}`}
                      className="flex items-start gap-2.5 text-white/55 hover:text-white text-sm transition-colors group">
                      <Phone size={13} className="mt-0.5 shrink-0 text-cyan/60 group-hover:text-cyan" />
                      <span>
                        {settings.phone}
                        {settings.phoneAlt && <><br /><span className="text-white/35 text-xs">{settings.phoneAlt}</span></>}
                      </span>
                    </a>
                  </li>
                )}

                {/* Email */}
                {settings.email && (
                  <li>
                    <a href={`mailto:${settings.email}`}
                      className="flex items-start gap-2.5 text-white/55 hover:text-white text-sm transition-colors group">
                      <Mail size={13} className="mt-0.5 shrink-0 text-cyan/60 group-hover:text-cyan" />
                      <span>
                        {settings.email}
                        {settings.emailAlt && <><br /><span className="text-white/35 text-xs">{settings.emailAlt}</span></>}
                      </span>
                    </a>
                  </li>
                )}

                {/* Address → links to Google Maps */}
                {settings.address && (
                  <li>
                    <a href={mapsLink || '#'} target={mapsLink ? '_blank' : undefined} rel="noopener noreferrer"
                      className="flex items-start gap-2.5 text-white/55 hover:text-white text-sm transition-colors group">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-cyan/60 group-hover:text-cyan" />
                      <span className="leading-relaxed">{settings.address}</span>
                    </a>
                  </li>
                )}

                {/* WhatsApp */}
                {waClean && (
                  <li>
                    <a href={`https://wa.me/${waClean}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-white/55 hover:text-green text-sm transition-colors group">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"
                        className="shrink-0 text-green/60 group-hover:text-green">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp Chat
                    </a>
                  </li>
                )}

                {/* Google Business link */}
                {(bizLink || mapsProfile) && (
                  <li>
                    <a href={bizLink || mapsProfile} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-white/50 hover:text-white text-sm transition-colors">
                      <ExternalLink size={12} className="shrink-0 text-cyan/50" />
                      Google Business Profile
                    </a>
                  </li>
                )}
              </ul>

              {/* ── Clinic Hours — from admin Contact tab ── */}
              {openDays.length > 0 && (
                <>
                  <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Clock size={11} className="text-cyan/60" /> Clinic Hours
                  </h4>
                  <div className="space-y-1.5">
                    {openDays.map((d) => (
                      <div key={d.day} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-white/40 w-8 shrink-0">{DAY_SHORT[d.day] || d.day}</span>
                        <span className="text-white/70 text-right">{fmt(d.open)} – {fmt(d.close)}</span>
                      </div>
                    ))}
                    {closedDays.length > 0 && (
                      <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-white/5">
                        <span className="text-white/30">{closedDays.join(', ')}</span>
                        <span className="text-error/60 font-medium">Closed</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      {/*
        pb-24 on mobile keeps the last line of text above the fixed chatbot button
        (button is bottom-24px + ~44px height = ~68px from bottom; 24 * 4 = 96px clears it).
        On sm+ the chat button shifts further right and the bar is two-line, so pb-5 is enough.
      */}
      <div className="bg-[#0c2350] border-t border-white/5">
        {/* Main bottom row */}
        <div className="container-max px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>© {year} {settings.siteTitle || 'UpBeat Heart'}. All rights reserved.</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {settings.hospitalName && (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan/40" />
                {settings.hospitalName}
              </span>
            )}
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms</Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors">Sitemap</a>
          </div>
        </div>

        {/* Developer credit row — sits above the chatbot button on mobile */}
        <div className="container-max px-4 pb-5 sm:pb-4 flex items-center justify-center gap-1.5 text-[11px] text-white/20">
          <span>Developed &amp; designed by</span>
          <a
            href="https://www.lockydev.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan/50 hover:text-cyan font-semibold transition-colors"
          >
            Locky Dev
            <ExternalLink size={9} className="mt-px" />
          </a>
        </div>

        {/* Spacer that pushes content above the fixed chatbot button on mobile */}
        <div className="h-20 sm:h-0" aria-hidden="true" />
      </div>
    </footer>
  )
}
