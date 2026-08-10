'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import usePrefersReducedMotion from './usePrefersReducedMotion'
import { FOCUS_SLIDES, SPECIALITY, SLIDE_DURATION } from './heroData'

/* Two full PQRST complexes across the card width */
const ECG_PATH =
  'M0 22 H96 l10 0 l7 -14 l8 27 l7 -20 l6 7 H236 l10 0 l7 -14 l8 27 l7 -20 l6 7 H400'

/**
 * FocusSlider — the hero's right column, dark-navy edition.
 *
 * Sits on the deep-navy #050D22 background. Every surface here uses the same
 * glassmorphism idiom as DoctorPanel: bg-white/[0.06] + backdrop-blur + a
 * white/10 border and the shared hero-ring spinning conic gradient outside.
 *
 * Logic is unchanged from the light version — only class names and colour
 * values are adapted for the dark field.
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

  return (
    <div
      className="relative anim-fade-right delay-150"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Spinning conic-gradient border ring — matches DoctorPanel */}
      <div className="hero-ring absolute -inset-[2px] rounded-[28px] pointer-events-none z-0" aria-hidden />

      <section
        aria-roledescription="carousel"
        aria-label="What this doctor treats"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative z-10 rounded-[26px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_18px_60px_rgba(2,8,26,0.55)] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#5B9BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050D22]"
      >
        {/* Top accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[linear-gradient(90deg,#5B9BFF,#41D6FF,#3EE68F)] z-20" aria-hidden />
        {/* Inner top-light so the glass reads as a surface */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.07] to-transparent pointer-events-none" aria-hidden />

        {/* Faint clinical grid behind the heart */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" aria-hidden>
          <defs>
            <pattern id="focusGrid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0L0 0 0 26" fill="none" stroke="rgba(120,170,255,0.9)" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#focusGrid)" />
        </svg>

        <div className="relative px-5 sm:px-7 pt-5 pb-5">

          {/* ══ Header ══ */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7FB5FF]/70">
                <Sparkles size={11} />
                {SPECIALITY.eyebrow}
              </span>
              <h2 className="mt-1 text-[21px] sm:text-[25px] font-extrabold tracking-tight leading-tight hero-title-grad">
                {SPECIALITY.title}
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 mt-0.5">
                {SPECIALITY.lead}
              </p>
            </div>

            {/* Nav arrows */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous focus area"
                className="group/btn relative w-9 h-9 rounded-xl border border-white/15 bg-white/[0.07] text-white/70 flex items-center justify-center overflow-hidden transition-all duration-150 hover:border-[#5B9BFF]/60 hover:text-[#7FB5FF] hover:bg-white/[0.13] active:scale-95"
              >
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#5B9BFF,#41D6FF,#3EE68F)] opacity-0 group-hover/btn:opacity-100 transition-opacity" aria-hidden />
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next focus area"
                className="group/btn relative w-9 h-9 rounded-xl border border-white/15 bg-white/[0.07] text-white/70 flex items-center justify-center overflow-hidden transition-all duration-150 hover:border-[#5B9BFF]/60 hover:text-[#7FB5FF] hover:bg-white/[0.13] active:scale-95"
              >
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,#5B9BFF,#41D6FF,#3EE68F)] opacity-0 group-hover/btn:opacity-100 transition-opacity" aria-hidden />
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* ══ Disease image — full-bleed across the card ══
               Negative margins break out of the px-5/px-7 card padding so
               the image fills edge-to-edge with no side gaps.               */}
          <div className="relative -mx-5 sm:-mx-7 h-[230px] sm:h-[265px] mt-3 overflow-hidden">
            {/* Subtle top/bottom fades so the image blends into the card */}
            <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#050D22]/60 to-transparent z-10 pointer-events-none" aria-hidden />
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#081735]/70 to-transparent z-10 pointer-events-none" aria-hidden />

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
                {/* Coloured radial glow behind the image */}
                <div
                  className="absolute inset-0 transition-all duration-700"
                  style={{
                    background: `radial-gradient(ellipse 80% 90% at 50% 60%, ${s.glow} 0%, transparent 72%)`,
                  }}
                />

                {/* Disease image fills the full area */}
                {s.diseaseImage && (
                  <img
                    src={s.diseaseImage}
                    alt={s.headline}
                    className="relative z-10 w-full h-full object-contain px-8 py-3"
                    style={{
                      filter: `drop-shadow(0 8px 32px ${s.glow}) drop-shadow(0 0 16px ${s.glow})`,
                    }}
                  />
                )}
              </div>
            ))}

            {/* Disease name label — bottom-left overlay */}
            <div className="absolute bottom-3 left-4 z-20">
              <span
                key={slide.id}
                className="hero-chip-in inline-flex items-center gap-1.5 rounded-full bg-black/40 border backdrop-blur-md px-3 py-1 text-[10px] font-extrabold"
                style={{ color: slide.accent, borderColor: slide.glow }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: slide.accent }} aria-hidden />
                {slide.headline}
              </span>
            </div>

            {/* Age badge — top-right */}
            {slide.age && (
              <span
                key={`age-${slide.id}`}
                className="hero-chip-in absolute top-3 right-4 flex items-center gap-1.5 rounded-full bg-white/[0.12] border backdrop-blur-sm px-2.5 py-1 text-[10px] font-extrabold z-20"
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
                  <stop offset="0%"   stopColor="#5B9BFF" stopOpacity="0" />
                  <stop offset="22%"  stopColor="#5B9BFF" stopOpacity="1" />
                  <stop offset="78%"  stopColor="#3EE68F" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3EE68F" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Resting trace */}
              <path
                d={ECG_PATH} pathLength={1000}
                stroke="url(#focusEcgFade)" strokeOpacity="0.22"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              {/* Travelling bright pulse */}
              <path
                d={ECG_PATH} pathLength={1000}
                stroke="url(#focusEcgFade)"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                className="hero-ecg-sweep"
              />
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
                      className={`min-h-[176px] rounded-2xl border border-white/[0.10] bg-white/[0.05] px-4 py-3.5 transition-all duration-500 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                      }`}
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
                        <span className="text-[10px] font-extrabold text-white/30 tabular-nums">
                          {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Headline with icon tile */}
                      <div className="flex items-start gap-2.5 mt-2">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
                          style={{ background: `${s.accent}1A`, borderColor: s.glow, color: s.accent }}
                          aria-hidden
                        >
                          <Icon size={16} />
                        </span>
                        <h3 className="text-[15px] sm:text-base font-extrabold text-white leading-snug pt-1">
                          {s.headline}
                        </h3>
                      </div>

                      <p className="mt-2 text-[12px] leading-relaxed text-white/60">
                        {s.detail}
                      </p>

                      {/* Chips — stagger in behind the slide */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {s.chips.map((c, ci) => (
                          <span
                            key={c}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/[0.07] backdrop-blur-sm transition-all duration-500 ${
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

          {/* ══ Dots + autoplay progress ══ */}
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
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 h-1.5' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  style={i === active ? { background: s.accent } : undefined}
                />
              ))}
            </div>

            <div className="flex-1 h-[3px] rounded-full bg-white/10 overflow-hidden" aria-hidden>
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
            <p className="text-[11px] text-white/50 font-medium leading-snug">
              {SPECIALITY.summary}
            </p>
            <Link
              href="/diseases"
              className="group flex items-center gap-1 text-[11px] font-extrabold text-[#7FB5FF] hover:text-white transition-colors flex-shrink-0"
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
