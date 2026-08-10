'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import PulsingHeart from './PulsingHeart'
import usePrefersReducedMotion from './usePrefersReducedMotion'
import { FOCUS_SLIDES, SPECIALITY, SLIDE_DURATION } from './heroData'

/* Two full PQRST complexes across the card width */
const ECG_PATH =
  'M0 22 H96 l10 0 l7 -14 l8 27 l7 -20 l6 7 H236 l10 0 l7 -14 l8 27 l7 -20 l6 7 H400'

/**
 * FocusSlider — the hero's right column.
 *
 * A slider that walks the visitor through exactly what this doctor treats:
 * the core focus (congenital & structural heart problems) followed by each
 * age group served, so the scope of care is understood in seconds without
 * reading a paragraph.
 *
 * The heart above the track is persistent rather than per-slide: it re-tints
 * and grows as the slider advances, which reads as one continuous patient
 * journey instead of five unrelated cards.
 *
 * Autoplay pauses on hover and focus. Arrow keys, arrow buttons, dots and
 * touch swipe all drive it manually. Under `prefers-reduced-motion` autoplay
 * stops and the slide changes without transitions.
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
  const onTouchEnd = (e: React.TouchEvent) => {
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
      {/* Spinning conic-gradient border ring */}
      <div className="hero-ring absolute -inset-[2px] rounded-[28px] pointer-events-none z-0" aria-hidden />

      <section
        aria-roledescription="carousel"
        aria-label="What this doctor treats"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative z-10 rounded-[26px] border border-border/40 bg-white shadow-[0_10px_50px_rgba(21,101,216,0.14)] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* Top accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] gradient-primary z-20" aria-hidden />

        {/* Faint grid so the heart floats on a clinical field */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" aria-hidden>
          <defs>
            <pattern id="focusGrid" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0L0 0 0 26" fill="none" stroke="#1565D8" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#focusGrid)" />
        </svg>

        <div className="relative px-5 sm:px-7 pt-5 pb-5">

          {/* ══ Header ══ */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary/50">
                <Sparkles size={11} />
                {SPECIALITY.eyebrow}
              </span>
              <h2 className="mt-1 text-[21px] sm:text-[25px] font-extrabold tracking-tight leading-tight shimmer-text">
                {SPECIALITY.title}
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary/45 mt-0.5">
                {SPECIALITY.lead}
              </p>
            </div>

            {/* Nav arrows */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous focus area"
                className="group/btn relative w-9 h-9 rounded-xl border border-border/80 bg-white flex items-center justify-center overflow-hidden shadow-sm transition-all duration-150 hover:border-primary hover:text-primary hover:shadow-[0_0_0_3px_rgba(21,101,216,0.10)] active:scale-95"
              >
                <span className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" aria-hidden />
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next focus area"
                className="group/btn relative w-9 h-9 rounded-xl border border-border/80 bg-white flex items-center justify-center overflow-hidden shadow-sm transition-all duration-150 hover:border-primary hover:text-primary hover:shadow-[0_0_0_3px_rgba(21,101,216,0.10)] active:scale-95"
              >
                <span className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" aria-hidden />
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* ══ Persistent heart — re-tints and grows with the active slide ══ */}
          <div className="relative flex justify-center items-center h-[215px] sm:h-[240px] mt-2">
            <PulsingHeart
              accent={slide.accent}
              glow={slide.glow}
              scale={slide.heartScale}
              showRepair={slide.showRepair}
              reduced={reduced}
            />

            {/* Age badge orbiting the heart — hidden on the core-focus slide */}
            {slide.age && (
              <span
                key={slide.id}
                className="hero-chip-in absolute top-3 right-0 sm:right-2 flex items-center gap-1.5 rounded-full bg-white border px-2.5 py-1 text-[10px] font-extrabold shadow-sm"
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
              <path
                d={ECG_PATH} pathLength={1000}
                stroke="url(#focusEcgFade)" strokeOpacity="0.22"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
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
                      className={`min-h-[176px] rounded-2xl border border-border/70 bg-bg/70 px-4 py-3.5 transition-all duration-500 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                      }`}
                    >
                      {/* Kicker row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em]"
                              style={{ color: s.accent }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.accent }} aria-hidden />
                          {s.kicker}
                        </span>
                        <span className="text-[10px] font-extrabold text-text-secondary/35 tabular-nums">
                          {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Headline with icon tile */}
                      <div className="flex items-start gap-2.5 mt-2">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
                          style={{ background: `${s.accent}14`, borderColor: s.glow, color: s.accent }}
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

                      {/* Chips — stagger in behind the slide */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {s.chips.map((c, ci) => (
                          <span
                            key={c}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white transition-all duration-500 ${
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
                    i === active ? 'w-6 h-1.5' : 'w-1.5 h-1.5 bg-border hover:bg-primary/40'
                  }`}
                  style={i === active ? { background: s.accent } : undefined}
                />
              ))}
            </div>

            <div className="flex-1 h-[3px] rounded-full bg-border/60 overflow-hidden" aria-hidden>
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
            <p className="text-[11px] text-text-secondary/70 font-medium leading-snug">
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
