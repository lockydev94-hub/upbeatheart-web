'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number          // ms delay before animation starts
  direction?: 'up' | 'down' | 'left' | 'right' | 'none' | 'scale' | 'grow'
  threshold?: number      // 0–1 intersection threshold
  duration?: number       // ms duration
}

/**
 * Wraps children in a div that fades + animates in when scrolled into view.
 * Uses IntersectionObserver — no layout shift before JS loads.
 * Supports: up, down, left, right, scale, grow, none
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.12,
  duration = 650,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  const INITIAL: Record<string, string> = {
    up:    'translateY(36px)',
    down:  'translateY(-24px)',
    left:  'translateX(-36px)',
    right: 'translateX(36px)',
    scale: 'scale(0.88)',
    grow:  'scale(0.85) translateY(20px)',
    none:  'none',
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Set initial hidden state immediately (before paint)
    el.style.opacity   = '0'
    el.style.transform = INITIAL[direction]

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1), transform ${duration}ms cubic-bezier(0.22,1,0.36,1)`
            el.style.opacity    = '1'
            el.style.transform  = 'none'
          }, delay)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, threshold, duration])

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0, transform: INITIAL[direction] }}
    >
      {children}
    </div>
  )
}
