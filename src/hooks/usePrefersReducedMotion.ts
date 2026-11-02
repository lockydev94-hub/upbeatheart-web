'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true when the visitor has asked the OS to reduce motion.
 *
 * Always false on the server and on the first client render so hydration
 * matches; flips to the real value inside the effect. CSS-only animations are
 * already handled by the `prefers-reduced-motion` block in globals.css — this
 * hook exists for the parts we can only switch off from JS (SMIL particles,
 * the stat count-up, the auto-advancing carousel, scroll reveals).
 */
export default function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
