'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ReviewCard from '@/components/reviews/ReviewCard'
import StarRating from '@/components/reviews/StarRating'
import type { Review } from '@/types/firestore'

interface Props { reviews: Review[] }

// NOTE: no placeholder/fabricated reviews. If Firestore has zero published
// reviews the section hides itself rather than show fake patient stories.

export default function ReviewsCarousel({ reviews }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [sectionVisible, setSectionVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [perPage, setPerPage] = useState(3)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setSectionVisible(true); obs.disconnect() } },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Detect responsive columns
  useEffect(() => {
    const update = () =>
      setPerPage(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Derived values (safe to compute with an empty list)
  const displayReviews = reviews.slice(0, 9) // show max 9 on home
  const maxIndex = Math.max(0, displayReviews.length - perPage)
  const prev = () => setCurrent((c) => Math.max(0, c - 1))
  const next = () => setCurrent((c) => (c >= maxIndex ? 0 : c + 1))

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(next, 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, current, maxIndex])

  // Hide the section entirely when there are no published reviews — never
  // substitute fabricated testimonials.
  if (reviews.length === 0) return null

  const avgRating =
    displayReviews.reduce((s, r) => s + r.rating, 0) / displayReviews.length

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 md:py-24 bg-white overflow-hidden"
    >
      <div className="container-max px-4 md:px-8">

        {/* ── Section header ── */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          style={{
            opacity:    sectionVisible ? 1 : 0,
            transform:  sectionVisible ? 'none' : 'translateY(-20px)',
            transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-widest mb-4">
              <Star size={10} fill="currentColor" />
              Patient Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#143B7D] leading-tight tracking-tight">
              What Our Patients Say
            </h2>
            <p className="text-[#6B7280] text-base mt-2 leading-relaxed">
              Real experiences from patients who trusted us with their cardiac care.
            </p>
          </div>

          {/* Aggregate rating box + "View all" CTA */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DCE3EC] shadow-sm text-center min-w-[90px]">
              <p className="text-3xl font-extrabold text-[#143B7D]">{avgRating.toFixed(1)}</p>
              <StarRating rating={Math.round(avgRating)} size="xs" />
              <p className="text-[10px] text-[#6B7280] mt-1 font-medium">
                {reviews.length}+ reviews
              </p>
            </div>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold hover:bg-[#143B7D] transition-colors shadow-sm"
            >
              All Reviews <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div
          className="relative"
          style={{
            opacity:    sectionVisible ? 1 : 0,
            transform:  sectionVisible ? 'none' : 'translateY(32px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s',
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(calc(-${current} * (100% / ${perPage} + ${perPage > 1 ? 20 : 0}px / ${perPage})))` }}
            >
              {displayReviews.map((review) => (
                <div
                  key={review.id}
                  className={`shrink-0 ${
                    perPage === 3
                      ? 'w-[calc(33.333%-14px)]'
                      : perPage === 2
                      ? 'w-[calc(50%-10px)]'
                      : 'w-full'
                  }`}
                >
                  <ReviewCard review={review} variant="compact" />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={prev}
              disabled={current === 0}
              className="w-10 h-10 rounded-full border-2 border-[#DCE3EC] flex items-center justify-center text-[#6B7280] hover:border-[#1565D8] hover:text-[#1565D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 h-2 bg-[#1565D8]'
                      : 'w-2 h-2 bg-[#DCE3EC] hover:bg-[#1565D8]/40'
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={current >= maxIndex}
              className="w-10 h-10 rounded-full border-2 border-[#DCE3EC] flex items-center justify-center text-[#6B7280] hover:border-[#1565D8] hover:text-[#1565D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Mobile "All Reviews" CTA below carousel */}
          <div className="flex justify-center mt-8 md:hidden">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#1565D8] text-[#1565D8] text-sm font-semibold hover:bg-[#1565D8] hover:text-white transition-colors"
            >
              All Reviews <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
