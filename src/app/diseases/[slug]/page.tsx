import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart, Shield, AlertTriangle, CheckCircle, BookOpen,
  ChevronRight, Calendar, Activity, ArrowRight, Phone,
  Stethoscope, Microscope, TrendingUp, Wind, Zap,
  Info, Clock, User, Star,
} from 'lucide-react'
import { getDiseaseBySlug, getAllDiseaseSlugs, getPublishedDiseases } from '@/lib/firestore/diseases'
import { medicalWebPageSchema, faqSchema, breadcrumbSchema, speakableSchema, videoObjectSchema, buildDiseaseKeywords } from '@/lib/seo'
import { getSiteSettings } from '@/lib/firestore/settings'
import { buildMetadata } from '@/lib/seo'
import { cloudinaryResize } from '@/lib/cloudinary'
import type { Disease } from '@/types/firestore'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com'

// ── Static params for SSG ────────────────────────────────────────────
export async function generateStaticParams() {
  const slugs = await getAllDiseaseSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const revalidate = 3600

// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const [disease, settings] = await Promise.all([
    getDiseaseBySlug(params.slug),
    getSiteSettings(),
  ])
  if (!disease || !settings) return {}

  const imgUrl = typeof disease.coverImage === 'object' && disease.coverImage
    ? disease.coverImage.url
    : typeof disease.coverImage === 'string' ? disease.coverImage : undefined

  return {
    ...buildMetadata({
      title:       disease.seo?.metaTitle  || disease.title,
      description: disease.seo?.metaDescription || stripHtml(disease.overview).slice(0, 155),
      path:        `/diseases/${params.slug}`,
      image:       disease.seo?.ogImage || imgUrl,
      imageAlt:    disease.title,
      settings,
      type:        'article',
      publishedAt: disease.publishedAt ? String(disease.publishedAt) : undefined,
      modifiedAt:  disease.updatedAt   ? String(disease.updatedAt)   : undefined,
      keywords:    disease.seo?.keywords || buildDiseaseKeywords(disease.title),
    }),
    openGraph: {
      title:       disease.seo?.ogTitle || disease.seo?.metaTitle || disease.title,
      description: disease.seo?.ogDescription || disease.seo?.metaDescription || stripHtml(disease.overview).slice(0, 155),
      url:         `${SITE_URL}/diseases/${params.slug}`,
      type:        'article',
      images:      [{ url: disease.seo?.ogImage || imgUrl || `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: disease.title }],
    },
  }
}

// ── Helpers ──────────────────────────────────────────────────────────
function stripHtml(html: string) {
  return html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? ''
}

function getCoverUrl(d: Disease) {
  if (!d.coverImage) return null
  const raw = typeof d.coverImage === 'string' ? d.coverImage : d.coverImage.url ?? ''
  return cloudinaryResize(raw, 1200, 630, 'fill')
}

function getCoverAlt(d: Disease) {
  if (!d.coverImage || typeof d.coverImage === 'string') return d.title
  return d.coverImage.alt ?? d.title
}

// ── Category icon & colour map ────────────────────────────────────────
const CAT_MAP: Record<string, { icon: React.ElementType; color: string; bg: string; badge: string }> = {
  'Heart Conditions':         { icon: Heart,       color: 'text-red-600',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700'    },
  'Arrhythmia':               { icon: Activity,    color: 'text-purple-600', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  'Valvular Heart Disease':   { icon: Shield,      color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  'Vascular Conditions':      { icon: TrendingUp,  color: 'text-blue-600',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700'   },
  'Congenital Heart Disease': { icon: Heart,       color: 'text-pink-600',   bg: 'bg-pink-50',   badge: 'bg-pink-100 text-pink-700'   },
  'Lifestyle & Prevention':   { icon: Stethoscope, color: 'text-green-600',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700' },
  'Cardiac Investigations':   { icon: Microscope,  color: 'text-cyan-600',   bg: 'bg-cyan-50',   badge: 'bg-cyan-100 text-cyan-700'   },
}
function catCfg(cat: string) {
  return CAT_MAP[cat] ?? { icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/8', badge: 'bg-primary/10 text-primary' }
}

// ── JSON-LD schema — uses seo.ts helpers ─────────────────────────────
function buildSchema(disease: Disease, settings: any) {
  const coverUrl = getCoverUrl(disease) || undefined

  const schemas: object[] = [
    // 1. MedicalWebPage (rich: reviewed-by, ICD code, keywords)
    medicalWebPageSchema({
      title:       disease.title,
      description: stripHtml(disease.overview).slice(0, 250),
      slug:        disease.slug,
      doctorName:  settings?.doctorName ?? '',
      doctorTitle: settings?.doctorTitle ?? 'Consultant Cardiologist',
      image:       coverUrl,
      publishedAt: disease.publishedAt ? String(disease.publishedAt) : undefined,
      updatedAt:   disease.updatedAt   ? String(disease.updatedAt)   : undefined,
      icdCode:     disease.icdCode,
      keywords:    disease.seo?.keywords || buildDiseaseKeywords(disease.title),
      category:    disease.category,
    }),
    // 2. BreadcrumbList
    breadcrumbSchema([
      { name: 'Home',     url: SITE_URL },
      { name: 'Diseases', url: `${SITE_URL}/diseases` },
      { name: disease.title },
    ]),
    // 3. SpeakableSpecification (voice search)
    speakableSchema(`${SITE_URL}/diseases/${disease.slug}`, ['h1', '.disease-overview', '.disease-symptoms']),
  ]

  // 4. FAQPage (if FAQs exist)
  if (disease.faqs?.length) {
    schemas.push(faqSchema(disease.faqs))
  }

  // 5. VideoObject (if videos exist)
  if (disease.videos?.length) {
    disease.videos.slice(0, 3).forEach((vid, i) => {
      const videoUrl = vid.cloudinaryUrl || vid.youtubeUrl || ''
      if (!videoUrl) return
      schemas.push(videoObjectSchema({
        name:         `${disease.title} — Video ${i + 1}`,
        description:  stripHtml(disease.overview).slice(0, 150),
        thumbnailUrl: vid.thumbnailUrl || coverUrl || `${SITE_URL}/og-default.jpg`,
        uploadDate:   disease.publishedAt ? String(disease.publishedAt) : new Date().toISOString(),
        contentUrl:   videoUrl,
      }))
    })
  }

  return schemas
}

// ── Content section renderer ──────────────────────────────────────────
function ContentSection({
  title, icon: Icon, children, id, accent = 'blue',
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  id?: string
  accent?: 'blue' | 'red' | 'green' | 'orange' | 'purple'
}) {
  const colors = {
    blue:   'text-primary bg-primary/10 border-primary/20',
    red:    'text-red-600 bg-red-50 border-red-100',
    green:  'text-green-600 bg-green-50 border-green-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
  }
  const iconCls = colors[accent]
  return (
    <section id={id} className="py-8 border-b border-border last:border-0">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${iconCls}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <h2 className="text-xl font-bold text-navy">{title}</h2>
      </div>
      {children}
    </section>
  )
}

// ── Prose HTML block ──────────────────────────────────────────────────
// Renders TipTap HTML from admin RichEditor — styled via .rich-content in globals.css
function ProseHtml({ html }: { html: string }) {
  if (!html || html === '<p></p>') return null
  return (
    <div
      className="rich-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ── List item ─────────────────────────────────────────────────────────
function BulletItem({ text, color = 'text-primary' }: { text: string; color?: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-text-secondary">
      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <span>{stripHtml(text)}</span>
    </li>
  )
}

// ── FAQ Accordion (client would need 'use client', so using details/summary) ──
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  // FAQ answers come from a <textarea> in admin (plain text), not RichEditor.
  // They may contain newlines — render as <p> per paragraph.
  const isHtml = /<[a-z][\s\S]*>/i.test(a)
  return (
    <details className="group border border-border rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer
        bg-white hover:bg-bg transition-colors select-none list-none">
        <span className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs
            font-bold flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </span>
          <span className="font-semibold text-navy text-sm leading-snug">{q}</span>
        </span>
        <ChevronRight className="w-4 h-4 text-text-secondary shrink-0 transition-transform
          group-open:rotate-90" />
      </summary>
      <div className="px-5 pb-5 pt-2 bg-white">
        <div className="pl-9">
          {isHtml ? (
            <ProseHtml html={a} />
          ) : (
            <div className="text-sm text-text-secondary leading-relaxed space-y-2">
              {a.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </details>
  )
}

// ── Main page component ───────────────────────────────────────────────
export default async function DiseaseDetailPage(
  { params }: { params: { slug: string } }
) {
  const [disease, settings, allDiseases] = await Promise.all([
    getDiseaseBySlug(params.slug),
    getSiteSettings(),
    getPublishedDiseases(20),
  ])

  if (!disease) notFound()

  const cfg      = catCfg(disease.category)
  const CatIcon  = cfg.icon
  const coverUrl = getCoverUrl(disease)
  const coverAlt = getCoverAlt(disease)
  const schemas  = buildSchema(disease, settings)

  // Related diseases: use admin-specified slugs first, then fall back to same category
  let related = disease.relatedDiseases?.length
    ? disease.relatedDiseases
        .map(slug => allDiseases.find(d => d.slug === slug))
        .filter((d): d is NonNullable<typeof d> => Boolean(d) && d!.id !== disease.id)
        .slice(0, 3)
    : []
  if (related.length < 3) {
    const extra = allDiseases
      .filter(d => d.id !== disease.id && d.category === disease.category && !related.some(r => r.id === d.id))
      .slice(0, 3 - related.length)
    related = [...related, ...extra]
  }

  const phone    = settings?.whatsapp ?? settings?.phone ?? ''
  const waClean  = phone.replace(/\D/g, '')

  return (
    <>
      {/* JSON-LD */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="min-h-screen bg-bg">

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/diseases" className="hover:text-primary transition-colors">Diseases</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-navy font-medium truncate max-w-[200px]">{disease.title}</span>
            </nav>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-dark text-white overflow-hidden">
          {/* Background cover image */}
          {coverUrl && (
            <div className="absolute inset-0 opacity-15">
              <Image src={coverUrl} alt="" fill className="object-cover" priority />
            </div>
          )}
          {/* ECG line decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10">
            <svg viewBox="0 0 1200 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <polyline
                points="0,24 100,24 140,8 160,40 180,4 200,44 220,24 300,24 340,14 360,34 380,24 1200,24"
                stroke="#18B8E6" strokeWidth="2" fill="none"
              />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="max-w-3xl">
              {/* Category badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                  bg-white/15 text-white backdrop-blur-sm`}>
                  <CatIcon className="w-3.5 h-3.5" />
                  {disease.category}
                </span>
                {disease.doctorVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                    bg-green/20 text-green-300 backdrop-blur-sm">
                    <Shield className="w-3.5 h-3.5" />
                    Doctor Verified
                  </span>
                )}
                {disease.icdCode && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono
                    bg-white/10 text-white/70">
                    ICD: {disease.icdCode}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
                {disease.title}
              </h1>
              {disease.tagline && (
                <p className="text-lg text-white/70 font-medium mb-6">{disease.tagline}</p>
              )}
              <p className="text-white/80 leading-relaxed max-w-2xl text-base">
                {stripHtml(disease.overview).slice(0, 200)}
                {stripHtml(disease.overview).length > 200 ? '…' : ''}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green font-semibold
                    text-white text-sm hover:bg-green/90 transition-all shadow-lg"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </Link>
                {waClean && (
                  <a
                    href={`https://wa.me/${waClean}?text=Hi, I have questions about ${encodeURIComponent(disease.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 font-semibold
                      text-white text-sm hover:bg-white/25 transition-all backdrop-blur-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Ask Doctor
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cover image (if exists, show below hero on mobile) ─────── */}
        {coverUrl && (
          <div className="hidden lg:block absolute right-0 top-0 w-80 h-64 rounded-bl-2xl overflow-hidden opacity-0 pointer-events-none" aria-hidden />
        )}

        {/* ── Body: two-column layout ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

            {/* ── Main content ──────────────────────────────────── */}
            <main className="flex-1 min-w-0">

              {/* Cover image (full-width on main column) */}
              {coverUrl && (
                <div className="relative rounded-2xl overflow-hidden mb-8 aspect-video bg-bg shadow-card">
                  <Image src={coverUrl} alt={coverAlt} fill className="object-cover" />
                </div>
              )}

              {/* Overview */}
              <ContentSection title="Overview" icon={BookOpen} id="overview" accent="blue">
                <ProseHtml html={disease.overview} />
              </ContentSection>

              {/* Causes */}
              {disease.causes && (
                <ContentSection title="Causes" icon={Info} id="causes" accent="orange">
                  <ProseHtml html={disease.causes} />
                </ContentSection>
              )}

              {/* Symptoms */}
              {disease.symptoms && (
                <ContentSection title="Symptoms" icon={Activity} id="symptoms" accent="red">
                  <ProseHtml html={disease.symptoms} />
                </ContentSection>
              )}

              {/* Risk Factors */}
              {disease.riskFactors?.length > 0 && (
                <ContentSection title="Risk Factors" icon={AlertTriangle} id="risk-factors" accent="orange">
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {disease.riskFactors.map((rf, i) => (
                      <BulletItem key={i} text={rf} color="text-orange-500" />
                    ))}
                  </ul>
                </ContentSection>
              )}

              {/* Diagnosis */}
              {disease.diagnosis && (
                <ContentSection title="Diagnosis" icon={Microscope} id="diagnosis" accent="purple">
                  <ProseHtml html={disease.diagnosis} />
                </ContentSection>
              )}

              {/* Treatment */}
              {disease.treatment && (
                <ContentSection title="Treatment" icon={Stethoscope} id="treatment" accent="green">
                  <ProseHtml html={disease.treatment} />
                </ContentSection>
              )}

              {/* Precautions */}
              {disease.precautions && (
                <ContentSection title="Precautions & Care" icon={Shield} id="precautions" accent="blue">
                  <ProseHtml html={disease.precautions} />
                </ContentSection>
              )}

              {/* Lifestyle */}
              {disease.lifestyle && (
                <ContentSection title="Lifestyle Modifications" icon={TrendingUp} id="lifestyle" accent="green">
                  <ProseHtml html={disease.lifestyle} />
                </ContentSection>
              )}

              {/* Additional Images */}
              {disease.images && disease.images.length > 0 && (
                <ContentSection title="Medical Images" icon={Wind} id="images" accent="blue">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {disease.images.map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-border bg-bg group">
                        <div className="relative aspect-video">
                          <Image src={cloudinaryResize(img.url, 480, 270, 'fill')} alt={img.alt || img.caption || disease.title} loading="lazy"
                            fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        {img.caption && (
                          <p className="px-2.5 py-1.5 text-[11px] text-text-secondary">{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ContentSection>
              )}

              {/* Videos */}
              {disease.videos && disease.videos.length > 0 && (
                <ContentSection title="Educational Videos" icon={Zap} id="videos" accent="blue">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {disease.videos.map((v, i) => {
                      const ytId = v.youtubeUrl?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]
                      if (ytId) {
                        return (
                          <div key={i} className="rounded-xl overflow-hidden bg-navy/5 border border-border">
                            <div className="relative aspect-video">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}`}
                                title={v.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            </div>
                            <div className="px-3 py-2.5">
                              {v.title && <p className="text-xs font-semibold text-navy">{v.title}</p>}
                              {v.description && <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{v.description}</p>}
                            </div>
                          </div>
                        )
                      }
                      if (v.cloudinaryUrl) {
                        return (
                          <div key={i} className="rounded-xl overflow-hidden bg-navy/5 border border-border">
                            <video
                              src={v.cloudinaryUrl}
                              poster={v.thumbnailUrl || undefined}
                              controls
                              className="w-full aspect-video object-cover"
                            />
                            <div className="px-3 py-2.5">
                              {v.title && <p className="text-xs font-semibold text-navy">{v.title}</p>}
                              {v.description && <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{v.description}</p>}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </ContentSection>
              )}

              {/* Infographics */}
              {disease.infographics && disease.infographics.length > 0 && (
                <ContentSection title="Health Infographics" icon={TrendingUp} id="infographics" accent="green">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {disease.infographics.map((inf, i) => (
                      <a key={i} href={inf.url} target="_blank" rel="noopener noreferrer"
                        className="group rounded-xl overflow-hidden border border-border bg-bg hover:shadow-card-hover transition-all">
                        <div className="relative aspect-[3/4] bg-bg">
                          <Image src={cloudinaryResize(inf.url, 400, 533, 'fit')} alt={inf.title}
                            fill className="object-contain p-1 group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="px-2.5 py-2 flex items-center justify-between gap-1">
                          <p className="text-[11px] font-medium text-navy line-clamp-1">{inf.title}</p>
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary mt-3">Click any infographic to view and download full size.</p>
                </ContentSection>
              )}

              {/* FAQs */}
              {disease.faqs?.length > 0 && (
                <ContentSection title="Frequently Asked Questions" icon={BookOpen} id="faq" accent="blue">
                  <div className="space-y-3">
                    {disease.faqs.map((faq, i) => (
                      <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
                    ))}
                  </div>
                </ContentSection>
              )}

            </main>

            {/* ── Sidebar ────────────────────────────────────────── */}
            <aside className="w-full lg:w-80 shrink-0 space-y-5 lg:sticky lg:top-24">

              {/* Quick Facts */}
              <div className="bg-white rounded-2xl border border-border shadow-card p-5">
                <h3 className="font-bold text-navy text-sm mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                      <CatIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </span>
                    <div>
                      <div className="text-text-secondary">Category</div>
                      <div className="font-semibold text-navy">{disease.category}</div>
                    </div>
                  </div>
                  {disease.icdCode && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                      </span>
                      <div>
                        <div className="text-text-secondary">ICD Code</div>
                        <div className="font-semibold font-mono text-navy">{disease.icdCode}</div>
                      </div>
                    </div>
                  )}
                  {disease.doctorVerified && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-7 h-7 rounded-lg bg-green/10 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-green" />
                      </span>
                      <div>
                        <div className="text-text-secondary">Verification</div>
                        <div className="font-semibold text-green-600">Doctor Verified</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Early Warning Signs */}
              {disease.earlyWarningSigns?.length > 0 && (
                <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
                  <h3 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Early Warning Signs
                  </h3>
                  <ul className="space-y-2">
                    {disease.earlyWarningSigns.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* When to See Doctor */}
              {disease.whenToSeeDoctor?.length > 0 && (
                <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
                  <h3 className="font-bold text-orange-800 text-sm mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    When to See a Doctor
                  </h3>
                  <ul className="space-y-2">
                    {disease.whenToSeeDoctor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-orange-700">
                        <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-orange-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Appointment CTA */}
              <div className="bg-gradient-dark rounded-2xl p-5 text-white">
                <h3 className="font-bold text-base mb-1">Book a Consultation</h3>
                <p className="text-white/70 text-xs mb-4 leading-relaxed">
                  Get expert cardiology advice from {settings?.doctorName ?? 'our specialist'}.
                </p>
                <Link
                  href="/appointment"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green
                    text-white text-sm font-semibold hover:bg-green/90 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </Link>
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/\D/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/15
                      text-white text-sm font-medium hover:bg-white/25 transition-all mt-2"
                  >
                    <Phone className="w-4 h-4" />
                    {settings.phone}
                  </a>
                )}
              </div>

              {/* On this page — anchor links */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-bold text-navy text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  On This Page
                </h3>
                <nav className="space-y-1">
                  {[
                    { href: '#overview',     label: 'Overview'               },
                    disease.causes         && { href: '#causes',       label: 'Causes'                 },
                    disease.symptoms       && { href: '#symptoms',     label: 'Symptoms'               },
                    disease.riskFactors?.length && { href: '#risk-factors', label: 'Risk Factors'     },
                    disease.diagnosis      && { href: '#diagnosis',    label: 'Diagnosis'              },
                    disease.treatment      && { href: '#treatment',    label: 'Treatment'              },
                    disease.precautions    && { href: '#precautions',  label: 'Precautions'            },
                    disease.lifestyle      && { href: '#lifestyle',    label: 'Lifestyle'              },
                    disease.videos?.length && { href: '#videos',        label: 'Videos'                 },
                    disease.infographics?.length && { href: '#infographics', label: 'Infographics'           },
                    disease.faqs?.length   && { href: '#faq',          label: 'FAQs'                   },
                  ].filter(Boolean).map((item: any, i) => (
                    <a
                      key={i}
                      href={item.href}
                      className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary
                        hover:bg-primary/5 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

            </aside>
          </div>
        </div>

        {/* ── Related Diseases ──────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="bg-white border-t border-border py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-navy">Related Conditions</h2>
                  <p className="text-text-secondary text-sm mt-1">Other {disease.category} conditions you may want to know about</p>
                </div>
                <Link
                  href="/diseases"
                  className="hidden sm:flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((rd) => {
                  const rc = catCfg(rd.category)
                  const RI = rc.icon
                  const rImg = rd.coverImage
                    ? cloudinaryResize(
                        typeof rd.coverImage === 'string' ? rd.coverImage : rd.coverImage.url ?? '',
                        480, 260, 'fill'
                      )
                    : null
                  return (
                    <Link
                      key={rd.id}
                      href={`/diseases/${rd.slug}`}
                      className="group bg-bg rounded-2xl border border-border overflow-hidden
                        hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                    >
                      {rImg ? (
                        <div className="relative h-36 bg-white">
                          <Image src={rImg} alt={rd.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className={`h-36 flex items-center justify-center ${rc.bg}`}>
                          <RI className={`w-12 h-12 ${rc.color} opacity-40`} />
                        </div>
                      )}
                      <div className="p-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.badge}`}>
                          {rd.category}
                        </span>
                        <h3 className="font-bold text-navy mt-2 text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {rd.title}
                        </h3>
                        {rd.tagline && (
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{rd.tagline}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Bottom Appointment CTA ────────────────────────────────── */}
        <section className="bg-gradient-primary py-16 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <Heart className="w-10 h-10 mx-auto mb-4 opacity-80 animate-pulse-heart" />
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Concerned About {disease.title}?
            </h2>
            <p className="text-white/80 mb-8 text-base leading-relaxed">
              Our expert cardiologist can evaluate your symptoms and guide you toward the right treatment.
              Early diagnosis saves lives.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary
                  font-bold text-sm hover:bg-white/90 transition-all shadow-lg"
              >
                <Calendar className="w-4.5 h-4.5" />
                Book Appointment Now
              </Link>
              <Link
                href="/patient-assistance"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/15
                  text-white font-semibold text-sm hover:bg-white/25 transition-all backdrop-blur-sm"
              >
                <Heart className="w-4.5 h-4.5" />
                Patient Assistance
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
