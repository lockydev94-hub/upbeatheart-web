'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import usePrefersReducedMotion from './usePrefersReducedMotion'
import { FOCUS_SLIDES, SPECIALITY, SLIDE_DURATION } from './heroData'

const ECG_PATH =
  'M0 22 H96 l10 0 l7 -14 l8 27 l7 -20 l6 7 H236 l10 0 l7 -14 l8 27 l7 -20 l6 7 H400'

/**
 * FocusSlider — upgraded with:
 *   - Mouse-tracking spotlight inside the card
 *   - Animated conic ring border (via .hero-ring)
 *   - Card float-in from the right
 *   - Nav arrows with hover glow
 *   - Active dot with pulse ring
 *   - Slide image with enhanced glow on active
 *   - Container hover lift + shadow
 */
export default function FocusSlider() {
  const reduced = usePrefersReducedMotion()

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const total = FOCUS_SLIDES.length
  const slide = FOCUS_SLIDES[active]

  const go   = useCallback((i: number) => setActive(((i % total) + total) % total), [total])
  const next = useCallback(() => go(active + 1), [active, go])
  const prev = useCallback(() => go(active - 1), [active, go])

  /* ── Autoplay ── */
  useEffect(() => {
    if (paused || reduced) return
    const t = setInterval(() => setActive((i) => (i + 1) % total), SLIDE_DURATION)
    return () => clearInterval(t)
  }, [paused, reduced, total])

  /* ── Touch swipe ── */
  const touchX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 45) (dx < 0 ? next : prev)()
    touchX.current = null
  }

  /* ── Keyboard ── */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
  }

  /* ── Mouse-tracking spotlight ── */
  const cardRef = useRef<HTMLDivElement>(null)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 30, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setSpotlight({ x, y, opacity: 1 })
  }
  const handleMouseLeave2 = () => {
    setSpotlight(s => ({ ...s, opacity: 0 }))
    setPaused(false)
  }

  return (
    <div
      className="relative hero-card-float-right"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave2}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Animated conic ring */}
      <div className="hero-ring absolute -inset-[2px] rounded-[28px] pointer-events-none z-0" aria-hidden />

      {/* Container glow aura */}
      <div className="hero-card-aura" aria-hidden />

      <section
        ref={cardRef}
        aria-roledescription="carousel"
        aria-label="What this doctor treats"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseMove={handleMouseMove}
        className="hero-card-interactive relative z-10 rounded-[26px] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_24px_70px_rgba(20,59,125,0.14),0_4px_18px_rgba(20,59,125,0.06)] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* Mouse spotlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-10"
          style={{
            background: `radial-gradient(320px circle at ${spotlight.x}% ${spotlight.y}%, rgba(21,101,216,0.06) 0%, transparent 65%)`,
            opacity: spotlight.opacity,
          }}
          aria-hidden
        />

        {/* Top accent strip — animated gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] z-20" aria-hidden
          style={{ background: `linear-gradient(90deg, #1565D8, ${slide.accent}, #18B55A)`, transition: 'background 0.6s ease' }} />

        {/* Inner top-light */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-[5]" aria-hidden />

        {/* Clinical grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none z-[1]" aria-hidden>
          <defs>
            <pattern id="focusGrid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0L0 0 0 26" fill="none" stroke="rgba(21,101,216,0.5)" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#focusGrid)" />
        </svg>

        <div className="relative z-10 px-5 sm:px-7 pt-5 pb-5">

          {/* ══ Header ══ */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary/70">
                <Sparkles size={11} />
                {SPECIALITY.eyebrow}
              </span>
              <h2 className="mt-1 text-[21px] sm:text-[25px] font-extrabold tracking-tight leading-tight hero-title-grad">
                {SPECIALITY.title}
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary mt-0.5">
                {SPECIALITY.lead}
              </p>
            </div>

            {/* Nav arrows — enhanced hover */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous focus area"
                className="group/btn relative w-9 h-9 rounded-xl border border-white/80 bg-white/70 text-navy/80 flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary/60 hover:text-primary hover:bg-white hover:shadow-[0_4px_16px_rgba(21,101,216,0.22)] active:scale-95"
              >
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#1565D8,#18B8E6)] opacity-0 group-hover/btn:opacity-100 transition-opacity" aria-hidden />
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next focus area"
                className="group/btn relative w-9 h-9 rounded-xl border border-white/80 bg-white/70 text-navy/80 flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary/60 hover:text-primary hover:bg-white hover:shadow-[0_4px_16px_rgba(21,101,216,0.22)] active:scale-95"
              >
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#1565D8,#18B8E6)] opacity-0 group-hover/btn:opacity-100 transition-opacity" aria-hidden />
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* ══ Disease image ══ */}
          <div className="relative -mx-5 sm:-mx-7 h-[230px] sm:h-[265px] mt-3 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-white/80 to-transparent z-10 pointer-events-none" aria-hidden />
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white/80 to-transparent z-10 pointer-events-none" aria-hidden />

            {FOCUS_SLIDES.map((s, i) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  i === active
                    ? 'opacity-100 scale-100 translate-y-0'
                    : i < active
                    ? 'opacity-0 scale-[1.04] -translate-y-6'
                    : 'opacity-0 scale-[1.04] translate-y-6'
                }`}
              >
                {/* Coloured radial glow — stronger when active */}
                <div
                  className="absolute inset-0 transition-all duration-700"
                  style={{
                    background: `radial-gradient(ellipse 80% 90% at 50% 60%, ${s.glow} 0%, transparent 72%)`,
                    opacity: i === active ? 1.2 : 0.7,
                  }}
                />
                {/* Second glow ring for depth */}
                {i === active && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 50% 55% at 50% 50%, ${s.glow} 0%, transparent 65%)`,
                      opacity: 0.5,
                    }}
                  />
                )}

                {s.diseaseImage && (
                  <Image
                    src={s.diseaseImage}
                    alt={s.headline}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="relative z-10 object-contain px-8 py-3"
                    style={{
                      filter: i === active
                        ? `drop-shadow(0 12px 30px ${s.glow}) drop-shadow(0 0 20px ${s.glow})`
                        : `drop-shadow(0 8px 24px ${s.glow}) drop-shadow(0 0 14px ${s.glow})`,
                      transition: 'filter 0.6s ease',
                    }}
                  />
                )}
              </div>
            ))}

            {/* Disease name label */}
            <div className="absolute bottom-3 left-4 z-20">
              <span
                key={slide.id}
                className="hero-chip-in inline-flex items-center gap-1.5 rounded-full bg-white/90 border backdrop-blur-md px-3 py-1 text-[10px] font-extrabold shadow-[0_4px_14px_rgba(20,59,125,0.10)]"
                style={{ color: slide.accent, borderColor: slide.glow }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: slide.accent }} aria-hidden />
                {slide.headline}
              </span>
            </div>

            {/* Age badge */}
            {slide.age && (
              <span
                key={`age-${slide.id}`}
                className="hero-chip-in absolute top-3 right-4 flex items-center gap-1.5 rounded-full bg-white/90 border backdrop-blur-sm px-2.5 py-1 text-[10px] font-extrabold z-20 shadow-[0_4px_14px_rgba(20,59,125,0.10)]"
                style={{ color: slide.accent, borderColor: slide.glow }}
              >
                <slide.icon size={11} />
                {slide.age}
              </span>
            )}
          </div>

          {/* ══ ECG trace ══ */}
          <div className="relative -mt-3 mb-1" aria-hidden>
            <svg viewBox="0 0 400 40" className="w-full h-8" fill="none">
              <defs>
                <linearGradient id="focusEcgFade" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#1565D8" stopOpacity="0" />
                  <stop offset="22%"  stopColor="#1565D8" stopOpacity="1" />
                  <stop offset="78%"  stopColor="#18B55A" stopOpacity="1" />
                  <stop offset="100%" stopColor="#18B55A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={ECG_PATH} pathLength={1000} stroke="url(#focusEcgFade)" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={ECG_PATH} pathLength={1000} stroke="url(#focusEcgFade)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="hero-ecg-sweep" />
            </svg>
          </div>

          {/* ══ Slide track ══ */}
          <div className="overflow-hidden">
            <div
              className={`flex ${reduced ? '' : 'transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {FOCUS_SLIDES.map((s, i) => {
                const isActive = i === active
                const Icon = s.icon

                return (
                  <div
                    key={s.id}
                    className="w-full flex-shrink-0"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${total}: ${s.headline}`}
                    aria-hidden={!isActive}
                  >
                    <div
                      className={`min-h-[176px] rounded-2xl border px-4 py-3.5 transition-all duration-500 ${
                        isActive
                          ? 'opacity-100 translate-y-0 bg-white/75 border-[#E4ECF6]'
                          : 'opacity-0 translate-y-3 bg-white/70 border-[#E4ECF6]'
                      }`}
                      style={isActive ? {
                        boxShadow: `0 0 0 1px ${s.glow}, 0 4px 20px rgba(20,59,125,0.06)`,
                        borderColor: s.glow,
                      } : undefined}
                    >
                      {/* Kicker row */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em]"
                          style={{ color: s.accent }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.accent }} aria-hidden />
                          {s.kicker}
                        </span>
                        <span className="text-[10px] font-extrabold text-text-secondary tabular-nums">
                          {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Headline with icon tile */}
                      <div className="flex items-start gap-2.5 mt-2">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300"
                          style={{
                            background: `${s.accent}1A`,
                            borderColor: s.glow,
                            color: s.accent,
                            boxShadow: isActive ? `0 0 12px ${s.glow}` : 'none',
                          }}
                          aria-hidden
                        >
                          <Icon size={16} />
                        </span>
                        <h3 className="text-[15px] sm:text-base font-extrabold text-navy leading-snug pt-1">
                          {s.headline}
                        </h3>
                      </div>

                      <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                        {s.detail}
                      </p>

                      {/* Chips */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {s.chips.map((c, ci) => (
                          <span
                            key={c}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/80 backdrop-blur-sm transition-all duration-500 ${
                              isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                            }`}
                            style={{
                              color:           s.accent,
                              borderColor:     s.glow,
                              transitionDelay: isActive ? `${180 + ci * 90}ms` : '0ms',
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ══ Dots + progress ══ */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Focus areas">
              {FOCUS_SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={s.label}
                  onClick={() => go(i)}
                  className={`rounded-full transition-all duration-300 relative ${
                    i === active ? 'w-6 h-1.5' : 'w-1.5 h-1.5 bg-[#B9CCE6] hover:bg-primary/50'
                  }`}
                  style={i === active ? { background: s.accent } : undefined}
                >
                  {/* Pulse ring on active dot */}
                  {i === active && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: s.accent, opacity: 0.3, animationDuration: '2s' }}
                      aria-hidden
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 h-[3px] rounded-full bg-[#DCE3EC] overflow-hidden" aria-hidden>
              <div
                key={`${active}-${paused}-${reduced}`}
                className="h-full rounded-full"
                style={{
                  background: slide.accent,
                  animation:  paused || reduced ? 'none' : `heroStageProgress ${SLIDE_DURATION}ms linear forwards`,
                  width:      paused || reduced ? '100%' : undefined,
                  opacity:    paused || reduced ? 0.3 : 1,
                }}
              />
            </div>
          </div>

          {/* ══ Closing line ══ */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-text-secondary font-medium leading-snug">
              {SPECIALITY.summary}
            </p>
            <Link
              href="/diseases"
              className="group flex items-center gap-1 text-[11px] font-extrabold text-primary hover:text-navy transition-colors flex-shrink-0"
            >
              All conditions
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}
