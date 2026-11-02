'use client'

import { type ComponentType, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import useScrollReveal, { type ScrollDirection } from '@/hooks/useScrollReveal'

/**
 * The effect vocabulary. Hidden/visible states for each live in globals.css
 * under the "ADVANCED SCROLL REVEAL SYSTEM" block, keyed off `data-reveal`.
 */
export type RevealEffect =
  | 'fade-up' | 'fade-down'
  | 'slide-left' | 'slide-right'
  | 'drift-left' | 'drift-right'
  | 'zoom-in' | 'zoom-out' | 'pop-center' | 'pulse-in'
  | 'blur-rise' | 'spotlight'
  | 'flip-y' | 'flip-x' | 'tilt-settle'
  | 'skew-rise' | 'rotate-in' | 'unfold'
  | 'curtain-up' | 'wipe-left' | 'wipe-right' | 'mask-zoom'

export interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'style'> {
  effect?: RevealEffect
  /** Stagger offset in ms — pass `i * 90` when mapping a list. */
  delay?: number
  /** Override the effect's own duration, in ms. */
  duration?: number
  /** Element to render. Defaults to a div. */
  as?: ElementType
  className?: string
  style?: CSSProperties
  children?: ReactNode
  /**
   * Drive the reveal from a parent section's single observer instead of
   * self-observing. Pass the `visible`/`direction` pair from useScrollReveal
   * when many children should animate off one trigger.
   */
  visible?: boolean
  direction?: ScrollDirection
  /** Trigger line, as a fraction of viewport height up from the bottom. */
  offset?: number
  /** Latch after the first play instead of replaying on every pass. */
  once?: boolean
}

/**
 * Declarative scroll reveal.
 *
 * Wraps content in an element carrying `data-reveal` / `data-visible`, which the
 * stylesheet turns into a transition. Effects replay on every pass — scroll down
 * past a section, back up, and down again and it animates each time. Directional
 * effects also flip their entry side to match the way the visitor is travelling.
 *
 *   <Reveal effect="flip-y" delay={i * 90}>…</Reveal>
 *
 * For a whole section's worth of children, run one observer in the section and
 * hand the result down instead of letting every child observe for itself:
 *
 *   const { ref, visible, direction } = useScrollReveal({ offset: 0.1 })
 *   <Reveal effect="mask-zoom" visible={visible} direction={direction}>…</Reveal>
 */
export default function Reveal({
  effect = 'fade-up',
  delay = 0,
  duration,
  as: Tag = 'div',
  className,
  style,
  children,
  visible: externalVisible,
  direction: externalDirection,
  offset,
  once,
  ...rest
}: RevealProps) {
  const driven = externalVisible !== undefined
  const self = useScrollReveal<HTMLElement>({ offset, once, disabled: driven })

  const visible = driven ? externalVisible : self.visible
  const direction = (driven ? externalDirection : self.direction) ?? 'down'

  // `as` is deliberately open-ended, so the props (and the ref) cannot be typed
  // per-tag here. Collecting them into a plain bag keeps TypeScript from having
  // to resolve the union of every intrinsic element.
  const Component = Tag as unknown as ComponentType<Record<string, unknown>>
  const props: Record<string, unknown> = {
    ...rest,
    'data-reveal': effect,
    'data-visible': visible ? 'true' : 'false',
    'data-dir': direction,
    className,
    style: {
      ...(delay ? { '--rv-delay': `${delay}ms` } : null),
      ...(duration ? { '--rv-dur': `${duration}ms` } : null),
      ...style,
    } as CSSProperties,
  }
  if (!driven) props.ref = self.ref

  return <Component {...props}>{children}</Component>
}
