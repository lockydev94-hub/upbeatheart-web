import { Metadata } from 'next'
import { Star, BadgeCheck, Quote, Play, ExternalLink, Users, ThumbsUp, Award } from 'lucide-react'
import Link from 'next/link'
import { getAllPublishedReviews } from '@/lib/firestore/reviews'
import { getSiteSettings }     from '@/lib/firestore/settings'
import ReviewCard              from '@/components/reviews/ReviewCard'
import StarRating              from '@/components/reviews/StarRating'
import type { Review }         from '@/types/firestore'
import ReviewSubmitModal       from '@/components/reviews/ReviewSubmitModal'
import LazyImage from '@/components/ui/LazyImage'
import { aggregateRatingSchema, breadcrumbSchema, buildMetadata } from '@/lib/seo'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://upbeatheart.com'

export const revalidate = 1800 // 30 min

/* ── Metadata ── */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return buildMetadata({
    title:       `Patient Reviews & Testimonials`,
    description: `Read genuine patient stories and testimonials for ${s?.doctorName ?? 'our cardiologist'}. Hear from real patients about their cardiac care experience.`,
    path:        '/reviews',
    image:       s?.ogImageUrl,
    settings:    s!,
    keywords: [
      'patient reviews cardiologist',
      'cardiology testimonials',
      'heart patient stories',
      s?.doctorName ? `${s.doctorName} reviews` : '',
      'best cardiologist reviews India',
    ].filter(Boolean) as string[],
  })
}

/* ── Rating distribution helper ── */
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-[#6B7280] w-3">{star}</span>
      <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-2.5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#DCE3EC]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-[#6B7280] font-medium w-6 text-right">{count}</span>
    </div>
  )
}

/* ── Google Review CTA card ── */
function GoogleCTACard({ businessUrl }: { businessUrl?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1565D8] via-[#18B8E6] to-[#18B55A] p-px">
      <div className="rounded-[calc(1.5rem-1px)] bg-white p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1565D8] to-[#18B8E6] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Star size={24} className="text-white fill-white" />
        </div>
        <h3 className="text-lg font-extrabold text-[#143B7D] mb-2">Share Your Experience</h3>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-5">
          Your story helps other patients make informed decisions about their heart health.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {businessUrl && (
            <a
              href={businessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#143B7D] transition-colors shadow-sm"
            >
              <ExternalLink size={14} /> Review on Google
            </a>
          )}
          <Link
            href="/appointment"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#1565D8] text-[#1565D8] text-sm font-semibold hover:bg-[#1565D8] hover:text-white transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Featured video review ── */
function FeaturedVideoCard({ review }: { review: Review }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143B7D] to-[#1565D8] p-8 text-white">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-5">
          <Play size={9} className="fill-white" /> Featured Video
        </div>

        <div className="flex items-start gap-3 mb-5">
          {review.photoURL ? (
            <div className="relative w-14 h-14 rounded-2xl shrink-0 overflow-hidden border-2 border-white/30">
              <LazyImage
                src={review.photoURL}
                alt={review.patientName}
                revealBlur
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-extrabold shrink-0">
              {review.patientName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-extrabold text-lg leading-tight">{review.patientName}</p>
            <StarRating rating={review.rating} size="sm" />
            <p className="text-white/60 text-xs mt-1">Verified Patient</p>
          </div>
        </div>

        <Quote size={20} className="text-white/30 mb-3" />
        <p className="text-white/90 text-sm leading-relaxed line-clamp-4 mb-6">
          {review.text}
        </p>

        <a
          href={review.videoURL!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1565D8] text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
        >
          <Play size={14} className="fill-[#1565D8]" /> Watch Testimonial
        </a>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([
    getAllPublishedReviews(),
    getSiteSettings(),
  ])

  // Derived stats
  const total       = reviews.length
  const avgRating   = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 5
  const fiveStars   = reviews.filter(r => r.rating === 5).length
  const googleCount = reviews.filter(r => r.source === 'google').length
  const videosCount = reviews.filter(r => r.videoURL).length
  const dist        = [5, 4, 3, 2, 1].map(n => ({
    star:  n,
    count: reviews.filter(r => r.rating === n).length,
  }))

  // Featured video review (first one with video)
  const featuredVideo = reviews.find(r => r.videoURL)

  // JSON-LD structured data — uses seo.ts helpers for full rich snippet eligibility
  const aggRatingLd = aggregateRatingSchema({
    reviews: reviews.map(r => ({
      patientName: r.patientName,
      rating:      r.rating,
      text:        r.text,
      publishedAt: r.createdAt ?? undefined,
    })),
    orgName: settings?.hospitalName ?? 'UpBeat Heart',
  })

  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home',    url: `${SITE_URL}/` },
    { name: 'Reviews', url: `${SITE_URL}/reviews` },
  ])

  return (
    <>
      {/* JSON-LD — AggregateRating for rich snippet + BreadcrumbList */}
      {aggRatingLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggRatingLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="bg-[#F8FAFC] min-h-screen">

        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#143B7D] via-[#1565D8] to-[#18B8E6] pt-24 pb-20 md:pt-32 md:pb-28">
          {/* Decorative bg elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
            <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-[#18B55A]/10" />
          </div>

          <div className="container-max px-4 md:px-8 relative">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-white/60 text-xs mb-8">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white font-medium">Patient Reviews</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: headline */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest mb-6">
                  <Star size={10} fill="currentColor" />
                  Patient Stories
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  What Our Patients<br />
                  <span className="text-[#18B8E6]">Say About Us</span>
                </h1>
                <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
                  Real experiences from real patients. Every heart has a story — here are the ones
                  that drive us forward every day.
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap gap-6">
                  {[
                    { icon: <Users size={16} />, value: `${total}+`, label: 'Reviews' },
                    { icon: <Star size={16} className="fill-amber-400 text-amber-400" />, value: avgRating.toFixed(1), label: 'Avg Rating' },
                    { icon: <ThumbsUp size={16} />, value: `${Math.round((fiveStars / Math.max(total, 1)) * 100)}%`, label: '5-Star' },
                    { icon: <Award size={16} />, value: `${googleCount}`, label: 'Google Reviews' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-white font-extrabold text-lg leading-none">{s.value}</p>
                        <p className="text-white/60 text-[10px] font-medium">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: aggregate rating card */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div>
                      <p className="text-6xl font-extrabold text-white leading-none">
                        {avgRating.toFixed(1)}
                      </p>
                      <StarRating rating={Math.round(avgRating)} size="md" />
                      <p className="text-white/60 text-xs mt-1">{total} verified reviews</p>
                    </div>
                    <div className="h-16 w-px bg-white/20" />
                    <div className="flex-1 space-y-2">
                      {dist.map(d => (
                        <RatingBar key={d.star} star={d.star} count={d.count} total={total} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-5 border-t border-white/20">
                    <BadgeCheck size={16} className="text-[#18B55A] shrink-0" />
                    <p className="text-white/70 text-xs leading-relaxed">
                      All reviews are from verified patients and are moderated by our team before publishing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════ */}
        <section className="py-16 md:py-20">
          <div className="container-max px-4 md:px-8">
            <div className="grid lg:grid-cols-3 gap-8">

              {/* ── LEFT: Reviews grid ── */}
              <div className="lg:col-span-2 space-y-8">

                {/* Featured video card (if any) */}
                {featuredVideo && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px flex-1 bg-[#DCE3EC]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] px-3">
                        Featured Testimonial
                      </span>
                      <div className="h-px flex-1 bg-[#DCE3EC]" />
                    </div>
                    <FeaturedVideoCard review={featuredVideo} />
                  </div>
                )}

                {/* All reviews grid */}
                {total === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#DCE3EC] p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#DCE3EC] flex items-center justify-center mx-auto mb-4">
                      <Star size={28} className="text-[#DCE3EC]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#143B7D] mb-2">Reviews Coming Soon</h3>
                    <p className="text-[#6B7280] text-sm mb-6">
                      We&apos;re collecting patient stories. Be the first to share yours!
                    </p>
                    {settings?.googleBusiness && (
                      <a
                        href={settings.googleBusiness}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#143B7D] transition-colors"
                      >
                        Leave a Google Review <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <div className="h-px flex-1 bg-[#DCE3EC]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#6B7280] px-3">
                          All {total} Reviews
                        </span>
                        <div className="h-px flex-1 bg-[#DCE3EC]" />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {reviews.map(review => (
                          <ReviewCard key={review.id} review={review} variant="full" />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── RIGHT: Sidebar ── */}
              <div className="space-y-6">

                {/* Rating summary (mobile-visible) */}
                <div className="lg:hidden bg-white rounded-3xl border border-[#DCE3EC] shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div>
                      <p className="text-5xl font-extrabold text-[#143B7D] leading-none">
                        {avgRating.toFixed(1)}
                      </p>
                      <StarRating rating={Math.round(avgRating)} size="sm" />
                      <p className="text-[#6B7280] text-xs mt-1">{total} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dist.map(d => (
                      <RatingBar key={d.star} star={d.star} count={d.count} total={total} />
                    ))}
                  </div>
                </div>

                {/* Trust signals */}
                <div className="bg-white rounded-3xl border border-[#DCE3EC] shadow-sm p-6">
                  <h3 className="text-sm font-extrabold text-[#143B7D] mb-4">Our Commitment</h3>
                  <div className="space-y-3">
                    {[
                      { icon: <BadgeCheck size={15} className="text-[#18B55A]" />, text: 'All reviews verified by our team' },
                      { icon: <Star size={15} className="text-amber-400 fill-amber-400" />, text: 'Only published with patient consent' },
                      { icon: <Users size={15} className="text-[#1565D8]" />, text: 'Real patients, real stories' },
                      { icon: <Award size={15} className="text-[#18B8E6]" />, text: 'Google Business verified' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#DCE3EC] flex items-center justify-center shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <p className="text-xs text-[#6B7280] leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video count badge */}
                {videosCount > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
                        <Play size={18} className="fill-white text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-purple-800 text-sm">{videosCount} Video Testimonials</p>
                        <p className="text-purple-600/70 text-xs">Watch real patient stories</p>
                      </div>
                    </div>
                    <p className="text-xs text-purple-700 leading-relaxed">
                      Some of our patients have shared their cardiac journey on video. Look for the &ldquo;Watch&rdquo; button on their reviews.
                    </p>
                  </div>
                )}

                {/* Google review CTA */}
                <GoogleCTACard businessUrl={settings?.googleBusiness} />

                {/* Quick links */}
                <div className="bg-white rounded-3xl border border-[#DCE3EC] shadow-sm p-6">
                  <h3 className="text-sm font-extrabold text-[#143B7D] mb-4">Explore More</h3>
                  <div className="space-y-2">
                    {[
                      { href: '/appointment', label: 'Book an Appointment' },
                      { href: '/patient-assistance', label: 'Patient Assistance' },
                      { href: '/diseases', label: 'Cardiac Treatments' },
                      { href: '/about', label: 'About the Doctor' },
                    ].map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#DCE3EC] transition-all group"
                      >
                        <span className="text-sm text-[#1F2937] font-medium group-hover:text-[#1565D8] transition-colors">
                          {link.label}
                        </span>
                        <ExternalLink size={12} className="text-[#DCE3EC] group-hover:text-[#1565D8] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            BOTTOM CTA STRIP
        ══════════════════════════════════════════ */}
        <section className="bg-gradient-to-r from-[#1565D8] via-[#18B8E6] to-[#18B55A] py-14">
          <div className="container-max px-4 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Ready to Start Your Heart Health Journey?
            </h2>
            <p className="text-white/80 text-base mb-7 max-w-xl mx-auto">
              Join thousands of patients who have trusted us with their cardiac care. Book your appointment today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1565D8] text-sm font-bold hover:bg-[#F8FAFC] transition-colors shadow-lg"
              >
                Book Appointment
              </Link>
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white/50 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </section>

      </main>
      {/* ── Float review button + modal (client component) ── */}
      <ReviewSubmitModal />
    </>
  )
}
