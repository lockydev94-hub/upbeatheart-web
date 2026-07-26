'use client'

/**
 * LazyImage v3 — Intersection-Observer lazy loader
 *
 * Key design decisions:
 *  - Wrapper fills parent via `absolute inset-0` by default (handles absolute inset-0 parents)
 *  - `aspectRatio` prop for standalone usage (e.g. blog cards, gallery thumbs)
 *  - Shimmer uses the global `.skeleton` CSS class — no styled-jsx, no @keyframes race
 *  - IntersectionObserver check deferred by one rAF so layout is complete before rect read
 *  - Always-load for above-fold elements (rootMargin pre-loads before IO fires)
 */

import { useEffect, useRef, useState, ImgHTMLAttributes } from 'react'

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  /** Blur → sharp transition on load */
  revealBlur?: boolean
  /** Scale-up on reveal */
  revealScale?: boolean
  /**
   * Aspect ratio string for STANDALONE usage, e.g. "16/9", "4/3".
   * When provided: wrapper = `relative w-full overflow-hidden` with that aspect ratio.
   * When omitted:  wrapper = `absolute inset-0` (fills a positioned parent).
   */
  aspectRatio?: string
  /** rootMargin for IntersectionObserver — pre-load before viewport hits */
  rootMargin?: string
  /** Extra classes on the wrapper div */
  wrapperClassName?: string
}

export default function LazyImage({
  src,
  alt = '',
  className = '',
  revealBlur = false,
  revealScale = false,
  aspectRatio,
  rootMargin = '200px',
  wrapperClassName = '',
  style,
  onClick,
  ...rest
}: LazyImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [inView,  setInView]  = useState(false)
  const [loaded,  setLoaded]  = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (!src) return
    const el = wrapperRef.current
    if (!el) return

    // Defer rect check by one animation frame so the browser has finished layout.
    // Without this, rect is 0×0 during hydration and the early-exit fires but
    // getBoundingClientRect may report incorrect values before paint.
    const raf = requestAnimationFrame(() => {
      if (!el) return

      const rect = el.getBoundingClientRect()
      // If element is already within 400px of the viewport (above-fold or near), load now.
      if (rect.top < window.innerHeight + 400) {
        setInView(true)
        return
      }

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            obs.disconnect()
          }
        },
        { rootMargin },
      )
      obs.observe(el)
      // Cleanup returns from inner rAF scope — we return it from the outer effect below
      ;(el as HTMLDivElement & { _lazyObs?: IntersectionObserver })._lazyObs = obs
    })

    return () => {
      cancelAnimationFrame(raf)
      const obs = (el as HTMLDivElement & { _lazyObs?: IntersectionObserver })._lazyObs
      if (obs) obs.disconnect()
    }
  }, [src, rootMargin])

  // ── Wrapper sizing ────────────────────────────────────────────────────────
  const wrapperBase = aspectRatio
    ? `relative overflow-hidden w-full ${wrapperClassName}`
    : `absolute inset-0 ${wrapperClassName}`

  const wrapperStyle: React.CSSProperties = aspectRatio
    ? { aspectRatio, ...(style ?? {}) }
    : {}

  return (
    <div
      ref={wrapperRef}
      className={wrapperBase}
      style={wrapperStyle}
      onClick={onClick}
    >
      {/* Shimmer skeleton — shown until image loads; uses global .skeleton class */}
      {!loaded && !error && (
        <div
          aria-hidden
          className="skeleton absolute inset-0"
        />
      )}

      {/* Image — src only set after inView */}
      {inView && src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setError(true) }}
          className={className}
          style={{
            opacity:    loaded ? 1 : 0,
            filter:     revealBlur  ? (loaded ? 'blur(0px)' : 'blur(6px)') : undefined,
            transform:  revealScale ? (loaded ? 'scale(1)'  : 'scale(1.04)') : undefined,
            transition: 'opacity 0.45s ease, filter 0.45s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)',
          }}
          {...rest}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8D3E0" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      )}
    </div>
  )
}
