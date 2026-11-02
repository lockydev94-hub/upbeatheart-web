'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import usePrefersReducedMotion from './usePrefersReducedMotion'

export type ScrollDirection = 'down' | 'up'

/* ───────────────────────────────────────────────────────────────────────────
   Shared scroll-direction tracker

   Every reveal on the page needs to know which way the visitor was moving at
   the moment it came into view, so directional effects can enter from the side
   the visitor is arriving from. One passive listener serves all of them.
   ─────────────────────────────────────────────────────────────────────────── */
let lastY = 0
let currentDir: ScrollDirection = 'down'
let subscribers = 0

function handleScroll() {
  const y = window.scrollY
  if (Math.abs(y - lastY) > 2) {
    currentDir = y > lastY ? 'down' : 'up'
    lastY = y
  }
}

function subscribeToScroll() {
  if (subscribers === 0) {
    lastY = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
  subscribers += 1
}

function unsubscribeFromScroll() {
  subscribers = Math.max(0, subscribers - 1)
  if (subscribers === 0) window.removeEventListener('scroll', handleScroll)
}

/** Latest scroll direction. Safe to read outside React. */
export function getScrollDirection(): ScrollDirection {
  return currentDir
}

export interface ScrollRevealOptions {
  /**
   * How deep into the viewport the element must travel before it reveals, as a
   * fraction of viewport height measured up from the bottom edge. The default
   * 0.12 reads as "reveal once it is 12% past the fold".
   */
  offset?: number
  /**
   * Latch the reveal after the first play. Off by default — the point of this
   * hook is that effects replay every time the section is scrolled past.
   */
  once?: boolean
  /**
   * Extra room around the viewport before the element counts as gone and
   * resets to its hidden state. Positive values ('20% 0px') reset sooner.
   */
  resetMargin?: string
  /** Skip observing and render the finished state immediately. */
  disabled?: boolean
}

export interface ScrollRevealState<T extends HTMLElement> {
  /** Attach to the element whose position drives the reveal. */
  ref: RefObject<T>
  /** True while the element is in play — drive transitions from this. */
  visible: boolean
  /** Which way the visitor was scrolling when the reveal last fired. */
  direction: ScrollDirection
  /**
   * Increments on every fresh entry. Use as a React `key` to restart what a
   * CSS transition cannot rewind by itself: `@keyframes` animations, SMIL,
   * count-up timers.
   */
  cycle: number
}

/**
 * Scroll reveal that replays.
 *
 * Two observers give the trigger hysteresis: the element reveals the moment it
 * crosses the trigger line, and only re-arms once it is completely clear of the
 * viewport. Without that gap an element parked near the line would flicker on
 * every small scroll nudge. Because the reset is symmetrical, scrolling back up
 * re-arms the reveal exactly the same way scrolling down does.
 */
export default function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
): ScrollRevealState<T> {
  const { offset = 0.12, once = false, resetMargin = '0px', disabled = false } = options

  const ref = useRef<T>(null)
  const shown = useRef(false)
  const [visible, setVisible] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [direction, setDirection] = useState<ScrollDirection>('down')
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced motion (and explicit opt-out) land straight on the end state.
    if (disabled || reduced) {
      shown.current = true
      setVisible(true)
      return
    }

    subscribeToScroll()

    const line = Math.round(Math.min(Math.max(offset, 0), 0.45) * 100)

    const enter = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || shown.current) return
        shown.current = true
        setDirection(currentDir)
        setCycle((c) => c + 1)
        setVisible(true)
      },
      { rootMargin: `0px 0px -${line}% 0px`, threshold: 0 },
    )
    enter.observe(el)

    let reset: IntersectionObserver | null = null
    if (!once) {
      reset = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting || !shown.current) return
          shown.current = false
          setVisible(false)
        },
        { rootMargin: resetMargin, threshold: 0 },
      )
      reset.observe(el)
    }

    return () => {
      enter.disconnect()
      reset?.disconnect()
      unsubscribeFromScroll()
    }
  }, [offset, once, resetMargin, disabled, reduced])

  return { ref, visible, direction, cycle }
}
