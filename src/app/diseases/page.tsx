import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart, Activity, Shield, TrendingUp, Stethoscope,
  Microscope, Wind, ArrowRight, CheckCircle, Search,
  ChevronRight, Calendar,
} from 'lucide-react'
import { getPublishedDiseases } from '@/lib/firestore/diseases'
import { getSiteSettings } from '@/lib/firestore/settings'
import { buildMetadata } from '@/lib/seo'
import { cloudinaryResize } from '@/lib/cloudinary'
import type { Disease } from '@/types/firestore'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  if (!settings) return {}
  return buildMetadata({
    title:       'Heart Diseases & Conditions',
    description: 'Comprehensive cardiology resource covering heart diseases, symptoms, causes, diagnosis and treatment options. Doctor-verified content by a consultant cardiologist.',
    path:        '/diseases',
    settings,
  })
}

// ── Helpers ──────────────────────────────────────────────────────────
function stripHtml(html: string) {
  return html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? ''
}

function getCardImg(d: Disease) {
  if (!d.coverImage) return null
  const raw = typeof d.coverImage === 'string' ? d.coverImage : d.coverImage.url ?? ''
  return cloudinaryResize(raw, 480, 280, 'fill')
}

// ── Category map ─────────────────────────────────────────────────────
const CATS = [
  { label: 'All',                     icon: Heart,       color: 'text-primary', bg: 'bg-primary/8',   badge: 'bg-primary/10 text-primary' },
  { label: 'Heart Conditions',        icon: Heart,       color: 'text-red-600', bg: 'bg-red-50',      badge: 'bg-red-100 text-red-700'    },
  { label: 'Arrhythmia',              icon: Activity,    color: 'text-purple-600', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  { label: 'Valvular Heart Disease',  icon: Shield,      color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  { label: 'Vascular Conditions',     icon: TrendingUp,  color: 'text-blue-600', bg: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700'   },
  { label: 'Congenital Heart Disease',icon: Heart,       color: 'text-pink-600', bg: 'bg-pink-50',    badge: 'bg-pink-100 text-pink-700'   },
  { label: 'Lifestyle & Prevention',  icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700' },
  { label: 'Cardiac Investigations',  icon: Microscope,  color: 'text-cyan-600', bg: 'bg-cyan-50',    badge: 'bg-cyan-100 text-cyan-700'   },
]
function catCfg(cat: string) {
  return CATS.find((c) => c.label === cat) ?? CATS[0]
}

// ── Disease Card ─────────────────────────────────────────────────────
function DiseaseCard({ disease }: { disease: Disease }) {
  const cfg    = catCfg(disease.category)
  const Icon   = cfg.icon
  const imgUrl = getCardImg(disease)
  const overview = stripHtml(disease.overview).slice(0, 115)

  return (
    <Link
      href={`/diseases/${disease.slug}`}
      className="group bg-white rounded-2xl border border-border overflow-hidden
        hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {/* Card image or icon */}
      {imgUrl ? (
        <div className="relative h-44 overflow-hidden bg-bg shrink-0">
          <Image src={imgUrl} alt={disease.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
          {/* Category badge on image */}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              bg-white/90 ${cfg.color} backdrop-blur-sm`}>
              <Icon className="w-3 h-3" />
              {disease.category}
            </span>
          </div>
          {disease.doctorVerified && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                bg-green/20 text-green-200 backdrop-blur-sm">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={`h-44 flex items-center justify-center ${cfg.bg} relative shrink-0`}>
          <Icon className={`w-16 h-16 ${cfg.color} opacity-20`} />
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              <Icon className="w-3 h-3" />
              {disease.category}
            </span>
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-navy text-base leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
          {disease.title}
        </h3>
        {disease.tagline && (
          <p className="text-xs text-primary font-medium mb-2">{disease.tagline}</p>
        )}
        <p className="text-xs text-text-secondary leading-relaxed flex-1 line-clamp-3">
          {overview}{overview.length >= 115 ? '…' : ''}
        </p>

        {/* Early warning signs chips */}
        {disease.earlyWarningSigns?.slice(0, 2).map((w, i) => (
          <span key={i} className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {w.length > 40 ? w.slice(0, 40) + '…' : w}
          </span>
        ))}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-text-secondary">
            {disease.faqs?.length ? `${disease.faqs.length} FAQs` : 'Detailed guide'}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            Learn more <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function DiseasesPage() {
  const [diseases, settings] = await Promise.all([
    getPublishedDiseases(60),
    getSiteSettings(),
  ])

  // Group by category
  const grouped = CATS.slice(1).reduce((acc, cat) => {
    const items = diseases.filter((d) => d.category === cat.label)
    if (items.length) acc.push({ ...cat, items })
    return acc
  }, [] as (typeof CATS[0] & { items: Disease[] })[])

  // Uncategorised
  const known = new Set(CATS.slice(1).map((c) => c.label))
  const others = diseases.filter((d) => !known.has(d.category))

  const totalCount = diseases.length

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 1200 300" className="w-full h-full">
            <polyline points="0,150 100,150 140,100 160,200 180,80 200,220 220,150 1200,150"
              stroke="#18B8E6" strokeWidth="3" fill="none" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4">
            <Heart className="w-3.5 h-3.5" />
            {totalCount} Conditions Covered
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            Heart Diseases &amp; Conditions
          </h1>
          <p className="text-white/75 max-w-2xl mx-auto text-base leading-relaxed">
            Doctor-verified cardiology resources covering symptoms, causes, diagnosis and treatment.
            Expert content by {settings?.doctorName ?? 'our cardiologist'}.
          </p>
          <div className="flex flex-wrap gap-3 mt-8 justify-center">
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green text-white
                font-semibold text-sm hover:bg-green/90 transition-all shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              Book Consultation
            </Link>
            <Link
              href="/diseases"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 text-white
                font-semibold text-sm hover:bg-white/25 transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              View Treatments
            </Link>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-navy font-medium">Diseases &amp; Conditions</span>
          </nav>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {grouped.map((group) => {
          const Icon = group.icon
          return (
            <section key={group.label}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${group.bg}`}>
                  <Icon className={`w-5 h-5 ${group.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">{group.label}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {group.items.length} condition{group.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {group.items.map((d) => (
                  <DiseaseCard key={d.id} disease={d} />
                ))}
              </div>
            </section>
          )
        })}

        {others.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-navy mb-6">Other Conditions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {others.map((d) => <DiseaseCard key={d.id} disease={d} />)}
            </div>
          </section>
        )}

        {diseases.length === 0 && (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-border mb-4" />
            <h3 className="text-lg font-bold text-navy mb-2">No Conditions Published Yet</h3>
            <p className="text-text-secondary text-sm">Check back soon — our cardiologist is preparing detailed guides.</p>
          </div>
        )}
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <section className="bg-gradient-primary py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Heart className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-extrabold mb-3">Have Cardiac Symptoms?</h2>
          <p className="text-white/80 mb-8 text-sm leading-relaxed">
            Don&apos;t wait. Our expert cardiologist can evaluate your condition and recommend the best course of action.
          </p>
          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary
              font-bold text-sm hover:bg-white/90 transition-all shadow-lg"
          >
            <Calendar className="w-4.5 h-4.5" />
            Book an Appointment
          </Link>
        </div>
      </section>

    </div>
  )
}
