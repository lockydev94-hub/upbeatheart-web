'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import usePrefersReducedMotion from './usePrefersReducedMotion'

export interface ScrollProgressState<T extends HTMLElement> {
  ref: RefObject<T>
  /**
   * How far the element has travelled through the viewport, 0 → 1.
   * 0 = its top edge is level with the bottom of the viewport,
   * 1 = its bottom edge has reached the top of the viewport.
   */
  progress: number
}

/**
 * Scroll-linked progress for the element it is attached to.
 *
 * Unlike {@link useScrollReveal}, which fires a one-shot transition, this drives
 * motion continuously from scroll position — the right tool for parallax, drift
 * and progress-bar style effects. Sampling is rAF-throttled and the observer
 * stops the listener whenever the element is off-screen, so an idle section
 * costs nothing.
 *
 * Returns a flat 0 under `prefers-reduced-motion` so callers can keep applying
 * their transform maths without special-casing it.
 */
export default function useScrollProgress<T extends HTMLElement = HTMLDivElement>(): ScrollProgressState<T> {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    let frame = 0
    let listening = false

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // Distance travelled over the full span from "entering" to "exited".
      const span = rect.height + vh
      const travelled = vh - rect.top
      setProgress(Math.min(Math.max(travelled / span, 0), 1))
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    const listen = (on: boolean) => {
      if (on === listening) return
      listening = on
      if (on) {
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        measure()
      } else {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
      }
    }

    // Only track while the element is anywhere near the viewport.
    const obs = new IntersectionObserver(
      ([entry]) => listen(entry.isIntersecting),
      { rootMargin: '10% 0px', threshold: 0 },
    )
    obs.observe(el)

    return () => {
      obs.disconnect()
      listen(false)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduced])

  return { ref, progress }
}
