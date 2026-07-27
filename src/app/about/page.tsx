import Image from 'next/image'
import Link from 'next/link'
import {
  GraduationCap, Award, Building2, Heart,
  Calendar, CheckCircle2, ArrowRight,
  Stethoscope, Users, Activity, Shield,
  BookOpen, Microscope, Globe, Phone,
} from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore/settings'
import { physicianSchema, medicalOrgSchema, breadcrumbSchema, buildMetadata } from '@/lib/seo'
import { cloudinaryPortrait } from '@/lib/cloudinary'
import type { SiteSettings } from '@/types/firestore'

export const revalidate = 60  // ISR safety net; on-demand bust via revalidateTag("settings")

export async function generateMetadata() {
  const s = await getSiteSettings()
  const title = `About ${s.doctorName || 'Our Doctor'}`
  const description = s.doctorBio
    || `Meet ${s.doctorName}, ${s.doctorTitle} at ${s.hospitalName}. Expert cardiac care with ${s.doctorExperience} of experience.`
  return buildMetadata({
    title,
    description,
    path: '/about',
    image: s.doctorPhotoUrl || s.ogImageUrl,
    imageAlt: `${s.doctorName} — ${s.doctorTitle}`,
    settings: s,
    keywords: [
      s.doctorName,
      s.doctorTitle,
      'cardiologist',
      'consultant cardiologist',
      s.hospitalName,
      'best cardiologist India',
      'heart specialist',
      s.doctorQuals,
    ].filter(Boolean) as string[],
  })
}

// ── JSON-LD schema (upgraded — uses full seo.ts helpers) ─────────────────────
function PhysicianSchema({ s }: { s: SiteSettings }) {
  const schemas = [
    physicianSchema(s),
    medicalOrgSchema(s),
    breadcrumbSchema([
      { name: 'Home', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com' },
      { name: `About ${s.doctorName}`, url: `${process.env.NEXT_PUBLIC_SITE_URL}/about` },
    ]),
  ]
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

// ── Static content (can be extended from Firestore later) ─────────────────────
const ACHIEVEMENTS = [
  { icon: Users,       value: '5,000+',  label: 'Patients Treated'     },
  { icon: Calendar,    value: '10+',     label: 'Years Experience'      },
  { icon: Award,       value: '1',       label: 'Gold Medal Award'      },
  { icon: BookOpen,    value: '20+',     label: 'Research Publications' },
]

const QUALIFICATIONS = [
  {
    degree: 'MBBS',
    institution: 'MKCG Medical College, Berhampur',
    year: '',
    icon: GraduationCap,
  },
  {
    degree: 'DNB — Paediatrics',
    institution: 'Tata Main Hospital, Jamshedpur',
    year: '',
    icon: BookOpen,
  },
  {
    degree: 'FNB — Paediatric Cardiology',
    institution: 'Frontier Lifeline (Dr. KM Cherian Heart Foundation) Hospital & Rabindranath Tagore International Institute of Cardiac Sciences, Chennai',
    year: '',
    icon: Stethoscope,
  },
]

const EXPERTISE = [
  { icon: Heart,       title: 'Device Closure — ASD / VSD / PDA', desc: 'Minimally invasive catheter-based closure of atrial septal defects, ventricular septal defects, and patent ductus arteriosus.' },
  { icon: Activity,    title: 'Balloon Valvuloplasty',             desc: 'Balloon pulmonary valvuloplasty and balloon aortic valvuloplasty for congenital valve stenosis in children.' },
  { icon: Stethoscope, title: 'Stenting for CoArctation',          desc: 'Stenting of coarctation segment to restore normal aortic blood flow in paediatric patients.' },
  { icon: Microscope,  title: 'Coil Embolization',                 desc: 'Coil embolization of major aortopulmonary collateral arteries (MAPCAs) in complex cyanotic heart diseases.' },
  { icon: Shield,      title: 'Diagnostic Catheterization',        desc: 'Preoperative diagnostic cardiac catheterization for Glenn shunt, Fontan surgeries, and complex cyanotic congenital heart diseases.' },
  { icon: Globe,       title: 'Rare Defect Closures',              desc: 'Closure of aorta to right atrial tunnel, ruptured sinus of Valsalva, and pulmonary arteriovenous fistula.' },
]

const MEMBERSHIPS = [
  'Indian Medical Association (IMA)',
  'Paediatric Cardiac Society of India (PCSI)',
  'Congenital Heart Surgeons\' Society (CHSS)',
  'Association of Physicians of India (API)',
  'SAIL Medical Officers\' Association',
]

const AWARDS = [
  { year: '🥇', title: 'Gold Medal — Best MBBS Paper, 30th All India Steel Medical Officer\'s Conference, SAIL-VISL Hospital' },
  { year: '📄', title: 'Numerous research papers, presentations and certifications in Paediatric Cardiology' },
  { year: '🏥', title: 'Expert in interventional paediatric cardiology — complex cyanotic congenital heart diseases' },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AboutPage() {
  const s = await getSiteSettings()
  const quals = s.doctorQuals?.split(',').map(q => q.trim()).filter(Boolean) ?? []

  return (
    <>
      <PhysicianSchema s={s} />

      {/* ══════════════════════════════════════════════
          HERO — full-width gradient banner
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-32"
        style={{ background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 60%, #18B55A 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
          {/* Subtle ECG line */}
          <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1200 60" fill="none" preserveAspectRatio="none">
            <polyline
              points="0,30 200,30 220,5 240,55 260,30 280,30 300,30 320,10 340,50 360,30 560,30 580,5 600,55 620,30 820,30 840,10 860,50 880,30 1200,30"
              stroke="white" strokeWidth="1.5" fill="none"
            />
          </svg>
        </div>

        <div className="container-max px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest">
                <Heart size={11} className="fill-white text-white" />
                About the Doctor
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                {s.doctorName || 'Expert Cardiologist'}
              </h1>
              <p className="text-white/80 text-lg font-medium">
                {s.doctorTitle || 'Consultant Cardiologist'}
                {s.hospitalName ? ` · ${s.hospitalName}` : ''}
              </p>
              {s.doctorBio && (
                <p className="text-white/70 text-base leading-relaxed max-w-xl">
                  {s.doctorBio}
                </p>
              )}

              {/* Qual pills */}
              {quals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quals.map(q => (
                    <span key={q} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white">
                      <CheckCircle2 size={11} className="text-green-300 shrink-0" />
                      {q}
                    </span>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-[#1565D8] hover:bg-white/90 transition shadow-lg"
                >
                  Book Appointment <ArrowRight size={15} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition"
                >
                  <Phone size={15} /> Contact Clinic
                </Link>
              </div>
            </div>

            {/* Right: Photo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[260px] md:w-[320px]">
                {/* Dashed ring */}
                <div className="absolute -inset-5 rounded-[2.5rem] border-2 border-dashed border-white/20" aria-hidden />

                <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/20">
                  {s.doctorPhotoUrl ? (
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={cloudinaryPortrait(s.doctorPhotoUrl, 500, 667, 0.72)}
                        alt={s.doctorName || 'Doctor'}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 260px, 320px"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#143B7D]/60 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] flex items-center justify-center bg-white/10">
                      <Heart size={80} className="text-white/20" fill="currentColor" />
                    </div>
                  )}
                </div>

                {/* Experience badge */}
                {s.doctorExperience && (
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-white shadow-xl border border-border/40 flex flex-col items-center justify-center">
                    <p className="text-2xl font-extrabold text-[#1565D8] leading-none">
                      {s.doctorExperience.replace(/\D/g, '')}
                    </p>
                    <p className="text-[9px] font-bold text-text-secondary text-center leading-tight mt-0.5">Years<br/>of Care</p>
                  </div>
                )}

                {/* Hospital badge */}
                {s.hospitalName && (
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-border/40 px-3 py-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1565D8]/10 flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-[#1565D8]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide">Associated</p>
                      <p className="text-[11px] font-extrabold text-navy leading-tight">{s.hospitalName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ACHIEVEMENTS STRIP
      ══════════════════════════════════════════════ */}
      <section className="bg-[#143B7D] py-10">
        <div className="container-max px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ACHIEVEMENTS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-1">
                  <Icon size={22} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold text-white leading-none">{value}</p>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          QUALIFICATIONS TIMELINE
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]">
        <div className="container-max px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1565D8]/8 border border-[#1565D8]/15 text-[#1565D8] text-[11px] font-bold uppercase tracking-widest mb-4">
              <GraduationCap size={11} />
              Academic Journey
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#143B7D] leading-tight">
              Qualifications &amp;{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)' }}
              >
                Education
              </span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1565D8] via-[#18B8E6] to-[#18B55A] opacity-30" />

            <div className="space-y-8">
              {QUALIFICATIONS.map(({ degree, institution, year, icon: Icon }, i) => (
                <div key={degree} className="relative flex gap-6 items-start pl-20">
                  {/* Node */}
                  <div
                    className="absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#1565D8,#18B8E6)' }}
                  >
                    <Icon size={24} className="text-white" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-2xl border border-[#DCE3EC] shadow-sm p-5 hover:shadow-md hover:border-[#1565D8]/30 transition-all duration-200">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-extrabold text-[#143B7D] text-base leading-tight">{degree}</p>
                        <p className="text-[#6B7280] text-sm mt-0.5">{institution}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-[#1565D8]/8 text-[#1565D8] border border-[#1565D8]/15">
                        {year}
                      </span>
                    </div>
                    {/* Progress dot */}
                    <div className="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full bg-[#1565D8] border-2 border-white shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          AREAS OF EXPERTISE
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-max px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18B55A]/8 border border-[#18B55A]/20 text-[#18B55A] text-[11px] font-bold uppercase tracking-widest mb-4">
              <Stethoscope size={11} />
              Paediatric Cardiology
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#143B7D]">
              Fields of{' '}
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)' }}>
                Expertise
              </span>
            </h2>
            <p className="text-[#6B7280] mt-3 max-w-xl mx-auto">
              Delivering expert interventional paediatric cardiac care through evidence-based practice and compassionate treatment of children with congenital heart disease.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXPERTISE.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group relative p-6 rounded-2xl border border-[#DCE3EC] bg-[#F8FAFC] hover:bg-white hover:border-[#1565D8]/30 hover:shadow-[0_4px_24px_rgba(21,101,216,0.10)] transition-all duration-300"
              >
                {/* Accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6,#18B55A)' }}
                />
                <div className="w-12 h-12 rounded-2xl bg-[#1565D8]/10 flex items-center justify-center mb-4 group-hover:bg-[#1565D8] transition-colors duration-300">
                  <Icon size={22} className="text-[#1565D8] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-extrabold text-[#143B7D] text-base mb-2">{title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MEMBERSHIPS + AWARDS  (2-col)
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]">
        <div className="container-max px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Memberships */}
            <div className="bg-white rounded-3xl border border-[#DCE3EC] shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1565D8]/10 flex items-center justify-center">
                  <Globe size={18} className="text-[#1565D8]" />
                </div>
                <h2 className="text-xl font-extrabold text-[#143B7D]">Professional Memberships</h2>
              </div>
              <ul className="space-y-3">
                {MEMBERSHIPS.map(m => (
                  <li key={m} className="flex items-center gap-3 py-2.5 border-b border-[#DCE3EC] last:border-0">
                    <CheckCircle2 size={16} className="text-[#18B55A] shrink-0" />
                    <span className="text-[#1F2937] text-sm font-medium">{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Awards */}
            <div className="bg-white rounded-3xl border border-[#DCE3EC] shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Award size={18} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-extrabold text-[#143B7D]">Awards &amp; Recognitions</h2>
              </div>
              <ul className="space-y-3">
                {AWARDS.map(({ year, title }) => (
                  <li key={title} className="flex items-start gap-3 py-2.5 border-b border-[#DCE3EC] last:border-0">
                    <span className="text-[11px] font-extrabold text-[#1565D8] bg-[#1565D8]/8 border border-[#1565D8]/15 px-2.5 py-1 rounded-full shrink-0 mt-0.5">
                      {year}
                    </span>
                    <span className="text-[#1F2937] text-sm font-medium leading-snug">{title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOSPITAL ASSOCIATION BANNER
      ══════════════════════════════════════════════ */}
      {s.hospitalName && (
        <section
          className="py-14 md:py-20"
          style={{ background: 'linear-gradient(135deg, #143B7D 0%, #1565D8 100%)' }}
        >
          <div className="container-max px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-white">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Building2 size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Practising at</p>
                  <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">{s.hospitalName}</h3>
                  {s.hospitalAddress && (
                    <p className="text-white/60 text-sm mt-1">{s.hospitalAddress}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-[#1565D8] hover:bg-white/90 transition shadow-lg"
                >
                  Book Appointment <ArrowRight size={15} />
                </Link>
                {s.mapsLink && (
                  <a
                    href={s.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition"
                  >
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          BOOK APPOINTMENT CTA
      ══════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="container-max px-4 md:px-8">
          <div className="rounded-3xl bg-[#F8FAFC] border border-[#DCE3EC] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1565D8]/10 flex items-center justify-center shrink-0">
                <Calendar size={26} className="text-[#1565D8]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#143B7D]">Ready to consult?</h3>
                <p className="text-[#6B7280] text-sm mt-0.5">Book a consultation with {s.doctorName || 'the doctor'} today.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white shadow-[0_4px_20px_rgba(21,101,216,0.25)] hover:opacity-95 transition"
                style={{ background: 'linear-gradient(90deg,#1565D8,#18B8E6)' }}
              >
                Book Now <ArrowRight size={15} />
              </Link>
              {s.phone && (
                <a
                  href={`tel:${s.phone}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border-2 border-[#1565D8]/25 text-[#1565D8] hover:bg-[#1565D8] hover:text-white transition"
                >
                  <Phone size={15} /> Call Now
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
